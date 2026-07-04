import type { INotebookModel } from "@jupyterlab/notebook";
import { CodeCell, MarkdownCell } from "@jupyterlab/cells";
import { NotebookActions, type Notebook } from "@jupyterlab/notebook";
import type { INotebookContent } from "@jupyterlab/nbformat";
import {
  buildNotebookOutline,
  findOutlineNode,
  getInsertIndexAfterSubtree,
  getInsertIndexForChild,
  getMindMapRootNode,
  navigateOutlineNode,
  type NotebookCell,
} from "lumen-kernel";

const EMPTY_CELL_SOURCE = "";

const resolveSiblingHeadingLevel = (
  outline: ReturnType<typeof buildNotebookOutline>,
  nodeId: string,
): number | null => {
  const located = findOutlineNode(outline, nodeId);

  if (!located) {
    return 1;
  }

  return located.node.headingLevel;
};

const resolveChildHeadingLevel = (
  outline: ReturnType<typeof buildNotebookOutline>,
  nodeId: string,
): number => {
  const located = findOutlineNode(outline, nodeId);

  if (!located) {
    return 1;
  }

  if (located.node.headingLevel !== null) {
    return Math.min(6, located.node.headingLevel + 1);
  }

  if (located.parent.headingLevel !== null) {
    return Math.min(6, located.parent.headingLevel + 1);
  }

  return 1;
};

const insertMarkdownCell = (
  notebook: Notebook,
  model: INotebookModel,
  index: number,
  headingLevel?: number,
): void => {
  model.sharedModel.insertCell(index, {
    cell_type: "markdown",
    metadata:
      headingLevel !== undefined
        ? { lumen: { headingLevel } }
        : {},
    source: EMPTY_CELL_SOURCE,
  });
  notebook.activeCellIndex = index;
  notebook.deselectAll();
  notebook.mode = "command";
};

const getNotebookCells = (model: INotebookModel): NotebookCell[] =>
  ((model.toJSON() as INotebookContent).cells ?? []) as NotebookCell[];

export const commitActiveMindMapCell = (notebook: Notebook): void => {
  const cell = notebook.activeCell;

  if (cell instanceof CodeCell) {
    void NotebookActions.run(notebook);
  } else if (cell instanceof MarkdownCell && !cell.rendered) {
    cell.rendered = true;
  }

  notebook.mode = "command";
};

export const insertMindMapSibling = (
  notebook: Notebook,
  model: INotebookModel,
): void => {
  const insertIndex =
    notebook.activeCellIndex < 0
      ? model.cells.length
      : getInsertIndexAfterSubtree(
          buildNotebookOutline(getNotebookCells(model)),
          `cell-${notebook.activeCellIndex}`,
          model.cells.length,
        );

  if (notebook.activeCellIndex < 0) {
    insertMarkdownCell(notebook, model, insertIndex, 1);
    return;
  }

  const outline = buildNotebookOutline(getNotebookCells(model));
  const level = resolveSiblingHeadingLevel(
    outline,
    `cell-${notebook.activeCellIndex}`,
  );

  if (level !== null) {
    insertMarkdownCell(notebook, model, insertIndex, level);
    return;
  }

  insertMarkdownCell(notebook, model, insertIndex);
};

export const insertMindMapChild = (
  notebook: Notebook,
  model: INotebookModel,
): void => {
  const insertIndex =
    notebook.activeCellIndex < 0
      ? model.cells.length
      : getInsertIndexForChild(
          buildNotebookOutline(getNotebookCells(model)),
          `cell-${notebook.activeCellIndex}`,
          model.cells.length,
        );

  if (notebook.activeCellIndex < 0) {
    insertMarkdownCell(notebook, model, insertIndex, 1);
    return;
  }

  const outline = buildNotebookOutline(getNotebookCells(model));
  const level = resolveChildHeadingLevel(
    outline,
    `cell-${notebook.activeCellIndex}`,
  );

  insertMarkdownCell(notebook, model, insertIndex, level);
};

export const selectMindMapCell = (
  notebook: Notebook,
  cellIndex: number,
): void => {
  if (cellIndex < 0 || cellIndex >= notebook.widgets.length) {
    return;
  }

  notebook.deselectAll();
  notebook.activeCellIndex = cellIndex;
  notebook.mode = "command";
};

export const selectRootMindMapCell = (
  notebook: Notebook,
  model: INotebookModel,
): void => {
  const outline = buildNotebookOutline(getNotebookCells(model));
  const rootNode = getMindMapRootNode(outline);

  if (rootNode?.cellIndex !== null && rootNode?.cellIndex !== undefined) {
    selectMindMapCell(notebook, rootNode.cellIndex);
  }
};

export const navigateMindMapSelection = (
  notebook: Notebook,
  model: INotebookModel,
  direction: "up" | "down" | "left" | "right",
  visibleIds: ReadonlySet<string>,
  collapsedIds: ReadonlySet<string>,
): boolean => {
  if (notebook.activeCellIndex < 0) {
    selectRootMindMapCell(notebook, model);
    return true;
  }

  const outline = buildNotebookOutline(getNotebookCells(model));
  const currentNodeId = `cell-${notebook.activeCellIndex}`;
  const target = navigateOutlineNode(
    outline,
    currentNodeId,
    direction,
    visibleIds,
    collapsedIds,
  );

  if (!target) {
    return false;
  }

  selectMindMapCell(notebook, target.cellIndex);
  return true;
};

export const isMindMapEditingText = (notebook: Notebook): boolean => {
  if (notebook.mode !== "edit") {
    return false;
  }

  const active = document.activeElement;

  if (!(active instanceof HTMLElement)) {
    return false;
  }

  return Boolean(
    active.closest(".jp-CodeMirrorEditor") ||
      active.closest(".jp-InputArea-editor") ||
      active.isContentEditable,
  );
};

export type MindMapShortcutResult =
  | false
  | "default"
  | "insert-edit"
  | "commit-stay";

export const handleMindMapShortcut = (
  notebook: Notebook,
  model: INotebookModel,
  event: KeyboardEvent,
  visibleIds: ReadonlySet<string>,
  collapsedIds: ReadonlySet<string>,
): MindMapShortcutResult => {
  const mod = event.metaKey || event.ctrlKey;

  if (isMindMapEditingText(notebook)) {
    if (event.key === "Escape") {
      notebook.mode = "command";
      event.preventDefault();
      return "default";
    }

    if (event.key === "Enter" && event.shiftKey && !mod) {
      commitActiveMindMapCell(notebook);
      insertMindMapSibling(notebook, model);
      event.preventDefault();
      return "insert-edit";
    }

    if (event.key === "Enter" && mod && !event.shiftKey) {
      commitActiveMindMapCell(notebook);
      event.preventDefault();
      return "commit-stay";
    }

    return false;
  }

  if (mod && event.key.toLowerCase() === "z" && !event.shiftKey) {
    NotebookActions.undo(notebook);
    event.preventDefault();
    return "default";
  }

  if (
    mod &&
    (event.key.toLowerCase() === "y" ||
      (event.key.toLowerCase() === "z" && event.shiftKey))
  ) {
    NotebookActions.redo(notebook);
    event.preventDefault();
    return "default";
  }

  if (mod && event.key.toLowerCase() === "c") {
    void NotebookActions.copy(notebook);
    event.preventDefault();
    return "default";
  }

  if (mod && event.key.toLowerCase() === "x") {
    NotebookActions.cut(notebook);
    event.preventDefault();
    return "default";
  }

  if (mod && event.key.toLowerCase() === "v") {
    NotebookActions.paste(notebook, "below");
    event.preventDefault();
    return "default";
  }

  if (mod && event.key === "Home") {
    selectRootMindMapCell(notebook, model);
    event.preventDefault();
    return "default";
  }

  if (event.key === "Delete" || event.key === "Backspace") {
    NotebookActions.deleteCells(notebook);
    event.preventDefault();
    return "default";
  }

  if (event.key === "Enter" && !event.shiftKey && !mod) {
    insertMindMapSibling(notebook, model);
    event.preventDefault();
    return "insert-edit";
  }

  if (event.key === "Tab" && !event.shiftKey && !mod) {
    insertMindMapChild(notebook, model);
    event.preventDefault();
    return "insert-edit";
  }

  if (event.key === "Escape") {
    notebook.mode = "command";
    event.preventDefault();
    return "default";
  }

  if (
    event.key === "ArrowUp" ||
    event.key === "ArrowDown" ||
    event.key === "ArrowLeft" ||
    event.key === "ArrowRight"
  ) {
    const direction =
      event.key === "ArrowUp"
        ? "up"
        : event.key === "ArrowDown"
          ? "down"
          : event.key === "ArrowLeft"
            ? "left"
            : "right";

    if (
      navigateMindMapSelection(
        notebook,
        model,
        direction,
        visibleIds,
        collapsedIds,
      )
    ) {
      event.preventDefault();
      return "default";
    }
  }

  return false;
};
