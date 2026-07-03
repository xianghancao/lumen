import type { INotebookModel } from "@jupyterlab/notebook";
import { NotebookActions, type Notebook } from "@jupyterlab/notebook";
import type { INotebookContent } from "@jupyterlab/nbformat";
import {
  buildNotebookOutline,
  findOutlineNode,
  getInsertIndexAfterSubtree,
  getMindMapRootNode,
  navigateOutlineNode,
  type NotebookCell,
  type OutlineNode,
} from "lumen-kernel";

const headingPrefix = (level: number, title: string) =>
  `${"#".repeat(Math.min(6, Math.max(1, level)))} ${title}\n`;

const resolveSiblingHeadingLevel = (
  outline: OutlineNode,
  nodeId: string,
): number | null => {
  const located = findOutlineNode(outline, nodeId);

  if (!located) {
    return 1;
  }

  if (located.node.headingLevel !== null) {
    return located.node.headingLevel;
  }

  return null;
};

const resolveChildHeadingLevel = (
  outline: OutlineNode,
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
  source: string,
): void => {
  model.sharedModel.insertCell(index, {
    cell_type: "markdown",
    metadata: {},
    source,
  });
  notebook.activeCellIndex = index;
  notebook.deselectAll();
  notebook.mode = "command";
};

const insertDefaultCell = (
  notebook: Notebook,
  model: INotebookModel,
  index: number,
): void => {
  model.sharedModel.insertCell(index, {
    cell_type: notebook.notebookConfig.defaultCell,
    metadata:
      notebook.notebookConfig.defaultCell === "code"
        ? { trusted: true }
        : {},
  });
  notebook.activeCellIndex = index;
  notebook.deselectAll();
  notebook.mode = "command";
};

const getNotebookCells = (model: INotebookModel): NotebookCell[] =>
  ((model.toJSON() as INotebookContent).cells ?? []) as NotebookCell[];

export const insertMindMapSibling = (
  notebook: Notebook,
  model: INotebookModel,
): void => {
  if (notebook.activeCellIndex < 0) {
    insertMarkdownCell(
      notebook,
      model,
      model.cells.length,
      headingPrefix(1, "New Topic"),
    );
    return;
  }

  const cells = getNotebookCells(model);
  const outline = buildNotebookOutline(cells);
  const activeIndex = notebook.activeCellIndex;
  const nodeId = `cell-${activeIndex}`;
  const insertIndex = getInsertIndexAfterSubtree(
    outline,
    nodeId,
    model.cells.length,
  );
  const level = resolveSiblingHeadingLevel(outline, nodeId);

  if (level !== null) {
    insertMarkdownCell(
      notebook,
      model,
      insertIndex,
      headingPrefix(level, "New Topic"),
    );
    return;
  }

  insertDefaultCell(notebook, model, insertIndex);
};

export const insertMindMapChild = (
  notebook: Notebook,
  model: INotebookModel,
): void => {
  if (notebook.activeCellIndex < 0) {
    insertMarkdownCell(
      notebook,
      model,
      model.cells.length,
      headingPrefix(1, "New Topic"),
    );
    return;
  }

  const cells = getNotebookCells(model);
  const outline = buildNotebookOutline(cells);
  const activeIndex = notebook.activeCellIndex;
  const nodeId = `cell-${activeIndex}`;
  const insertIndex = getInsertIndexAfterSubtree(
    outline,
    nodeId,
    model.cells.length,
  );
  const level = resolveChildHeadingLevel(outline, nodeId);

  insertMarkdownCell(
    notebook,
    model,
    insertIndex,
    headingPrefix(level, "New Subtopic"),
  );
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

export const handleMindMapShortcut = (
  notebook: Notebook,
  model: INotebookModel,
  event: KeyboardEvent,
  visibleIds: ReadonlySet<string>,
  collapsedIds: ReadonlySet<string>,
): boolean => {
  const mod = event.metaKey || event.ctrlKey;

  if (isMindMapEditingText(notebook)) {
    if (event.key === "Escape") {
      notebook.mode = "command";
      event.preventDefault();
      return true;
    }

    return false;
  }

  if (mod && event.key.toLowerCase() === "z" && !event.shiftKey) {
    NotebookActions.undo(notebook);
    event.preventDefault();
    return true;
  }

  if (
    mod &&
    (event.key.toLowerCase() === "y" ||
      (event.key.toLowerCase() === "z" && event.shiftKey))
  ) {
    NotebookActions.redo(notebook);
    event.preventDefault();
    return true;
  }

  if (mod && event.key.toLowerCase() === "c") {
    void NotebookActions.copy(notebook);
    event.preventDefault();
    return true;
  }

  if (mod && event.key.toLowerCase() === "x") {
    NotebookActions.cut(notebook);
    event.preventDefault();
    return true;
  }

  if (mod && event.key.toLowerCase() === "v") {
    NotebookActions.paste(notebook, "below");
    event.preventDefault();
    return true;
  }

  if (mod && event.key === "Home") {
    selectRootMindMapCell(notebook, model);
    event.preventDefault();
    return true;
  }

  if (event.key === "Delete" || event.key === "Backspace") {
    NotebookActions.deleteCells(notebook);
    event.preventDefault();
    return true;
  }

  if (event.key === "Enter" && !event.shiftKey && !mod) {
    insertMindMapSibling(notebook, model);
    event.preventDefault();
    return true;
  }

  if (event.key === "Tab" && !event.shiftKey && !mod) {
    insertMindMapChild(notebook, model);
    event.preventDefault();
    return true;
  }

  if (event.key === "Escape") {
    notebook.mode = "command";
    event.preventDefault();
    return true;
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
      return true;
    }
  }

  return false;
};
