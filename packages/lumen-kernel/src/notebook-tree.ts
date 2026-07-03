import { parseMarkdownHeading } from "./notebook-outline";
import type { NotebookCell, OutlineNode } from "./types";

const joinCellSource = (source: string | string[]) =>
  Array.isArray(source) ? source.join("") : source;

export type OutlineNodeLocation = {
  node: OutlineNode;
  parent: OutlineNode;
  index: number;
};

export type NotebookReorderPlan = {
  /** Desired sequence of original cell indices. */
  order: number[];
  /** Updated markdown sources keyed by original cell index. */
  sourceUpdates: Map<number, string>;
};

export type DropZone = "before" | "inside" | "after";

export const cloneOutlineNode = (node: OutlineNode): OutlineNode => ({
  ...node,
  children: node.children.map(cloneOutlineNode),
});

export const findOutlineNode = (
  root: OutlineNode,
  nodeId: string,
): OutlineNodeLocation | null => {
  const search = (parent: OutlineNode): OutlineNodeLocation | null => {
    const index = parent.children.findIndex((child) => child.id === nodeId);

    if (index >= 0) {
      return { node: parent.children[index]!, parent, index };
    }

    for (const child of parent.children) {
      const found = search(child);

      if (found) {
        return found;
      }
    }

    return null;
  };

  if (nodeId === root.id) {
    return null;
  }

  return search(root);
};

export const isOutlineDescendant = (
  root: OutlineNode,
  ancestorId: string,
  descendantId: string,
): boolean => {
  const ancestor =
    ancestorId === root.id
      ? root
      : (findOutlineNode(root, ancestorId)?.node ?? null);

  if (!ancestor) {
    return false;
  }

  const visit = (node: OutlineNode): boolean => {
    if (node.id === descendantId) {
      return true;
    }

    return node.children.some(visit);
  };

  return visit(ancestor);
};

export const detachOutlineNode = (
  root: OutlineNode,
  nodeId: string,
): OutlineNode | null => {
  const found = findOutlineNode(root, nodeId);

  if (!found) {
    return null;
  }

  const [removed] = found.parent.children.splice(found.index, 1);
  return removed ?? null;
};

export const insertOutlineNode = (
  parent: OutlineNode,
  node: OutlineNode,
  index: number,
): void => {
  const boundedIndex = Math.max(0, Math.min(index, parent.children.length));
  parent.children.splice(boundedIndex, 0, node);
};

export const moveOutlineNode = (
  root: OutlineNode,
  nodeId: string,
  targetParentId: string,
  insertIndex: number,
): OutlineNode | null => {
  const cloned = cloneOutlineNode(root);

  if (nodeId === "root") {
    return null;
  }

  const targetParent =
    targetParentId === "root"
      ? cloned
      : (findOutlineNode(cloned, targetParentId)?.node ?? null);

  if (!targetParent) {
    return null;
  }

  if (
    nodeId === targetParentId ||
    isOutlineDescendant(cloned, nodeId, targetParentId)
  ) {
    return null;
  }

  const originalLocation = findOutlineNode(cloned, nodeId);

  if (!originalLocation) {
    return null;
  }

  const removed = detachOutlineNode(cloned, nodeId);

  if (!removed) {
    return null;
  }

  let adjustedIndex = insertIndex;

  if (
    originalLocation.parent.id === targetParent.id &&
    originalLocation.index < insertIndex
  ) {
    adjustedIndex -= 1;
  }

  insertOutlineNode(targetParent, removed, adjustedIndex);
  return cloned;
};

export const resolveDropTarget = (
  root: OutlineNode,
  draggedId: string,
  targetNodeId: string,
  zone: DropZone,
): { parentId: string; insertIndex: number } | null => {
  if (draggedId === targetNodeId) {
    return null;
  }

  if (isOutlineDescendant(root, draggedId, targetNodeId)) {
    return null;
  }

  if (zone === "inside") {
    const parent =
      targetNodeId === "root"
        ? root
        : (findOutlineNode(root, targetNodeId)?.node ?? null);

    if (!parent) {
      return null;
    }

    return { parentId: parent.id, insertIndex: parent.children.length };
  }

  const target = findOutlineNode(root, targetNodeId);

  if (!target) {
    return null;
  }

  if (zone === "before") {
    return { parentId: target.parent.id, insertIndex: target.index };
  }

  return { parentId: target.parent.id, insertIndex: target.index + 1 };
};

export const normalizeOutlineHeadingLevels = (root: OutlineNode): void => {
  const visit = (node: OutlineNode, parentHeadingLevel: number) => {
    node.children.forEach((child) => {
      if (child.headingLevel !== null) {
        child.headingLevel = Math.min(6, parentHeadingLevel + 1);
        visit(child, child.headingLevel);
      } else {
        visit(child, parentHeadingLevel);
      }
    });
  };

  visit(root, 0);
};

export const replaceMarkdownHeadingTitle = (
  source: string,
  newTitle: string,
): string => {
  const lines = source.split("\n");
  const lineIndex = lines.findIndex((line) => line.trim().length > 0);

  if (lineIndex < 0) {
    return source;
  }

  const line = lines[lineIndex]!;
  const trimmed = line.trim();
  const match = trimmed.match(/^(#{1,6})\s+(.+)$/);

  if (!match?.[1]) {
    return source;
  }

  const leading = line.slice(0, line.indexOf(trimmed));
  lines[lineIndex] = `${leading}${match[1]} ${newTitle.trim()}`;
  return lines.join("\n");
};

export const updateMarkdownHeadingSource = (
  source: string,
  level: number,
): string => {
  const lines = source.split("\n");
  const lineIndex = lines.findIndex((line) => line.trim().length > 0);

  if (lineIndex < 0) {
    return source;
  }

  const line = lines[lineIndex]!;
  const trimmed = line.trim();
  const match = trimmed.match(/^(#{1,6})\s+(.+)$/);

  if (!match?.[2]) {
    return source;
  }

  const leading = line.slice(0, line.indexOf(trimmed));
  lines[lineIndex] = `${leading}${"#".repeat(level)} ${match[2]}`;
  return lines.join("\n");
};

export const flattenOutlineCellNodes = (root: OutlineNode): OutlineNode[] => {
  const items: OutlineNode[] = [];

  const visit = (node: OutlineNode) => {
    if (node.cellIndex !== null) {
      items.push(node);
    }

    node.children.forEach(visit);
  };

  visit(root);
  return items;
};

export const computeNotebookReorderPlan = (
  root: OutlineNode,
  cells: NotebookCell[],
): NotebookReorderPlan => {
  const working = cloneOutlineNode(root);
  normalizeOutlineHeadingLevels(working);

  const orderedNodes = flattenOutlineCellNodes(working);
  const order = orderedNodes.map((node) => node.cellIndex!);
  const sourceUpdates = new Map<number, string>();

  orderedNodes.forEach((node) => {
    if (node.headingLevel === null || node.cellIndex === null) {
      return;
    }

    const cell = cells[node.cellIndex];

    if (!cell || cell.cell_type !== "markdown") {
      return;
    }

    const source = joinCellSource(cell.source);

    if (!parseMarkdownHeading(source.trim())) {
      return;
    }

    const updated = updateMarkdownHeadingSource(source, node.headingLevel);

    if (updated !== source) {
      sourceUpdates.set(node.cellIndex, updated);
    }
  });

  return { order, sourceUpdates };
};
