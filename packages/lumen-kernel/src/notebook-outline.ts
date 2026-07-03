import type { NotebookCell, OutlineNode } from "./types";

const joinCellSource = (source: string | string[]) =>
  Array.isArray(source) ? source.join("") : source;

export const parseMarkdownHeading = (source: string) => {
  const firstLine =
    source.split("\n").find((line) => line.trim().length > 0)?.trim() ?? "";
  const match = firstLine.match(/^(#{1,6})\s+(.+)$/);

  if (!match?.[2]) {
    return null;
  }

  return {
    level: match[1].length,
    title: match[2].trim(),
  };
};

const cellTitle = (cell: NotebookCell, cellIndex: number) => {
  const source = joinCellSource(cell.source).trim();
  const heading = cell.cell_type === "markdown" ? parseMarkdownHeading(source) : null;

  if (heading) {
    return heading.title;
  }

  const firstLine = source.split("\n").find((line) => line.trim())?.trim();
  return firstLine || `${cell.cell_type} cell ${cellIndex + 1}`;
};

type HeadingFrame = {
  level: number;
  node: OutlineNode;
};

/**
 * Build a tree from notebook cells using markdown heading levels.
 *
 * - `#`（一级标题）→ 导图根节点（虚拟 root 的子节点，布局时不显示虚拟 root）
 * - `##` / `###` / … → 根节点下按层级嵌套
 * - 其他 cell → 挂在当前标题节点下
 * - 第一个 `#` 之前的内容，或没有 `#` 时出现的 `##+`，会被忽略
 */
export const buildNotebookOutline = (cells: NotebookCell[]): OutlineNode => {
  const root: OutlineNode = {
    id: "root",
    cellIndex: null,
    headingLevel: null,
    title: "",
    children: [],
  };
  const headingStack: HeadingFrame[] = [];

  cells.forEach((cell, cellIndex) => {
    const source = joinCellSource(cell.source);
    const heading =
      cell.cell_type === "markdown" ? parseMarkdownHeading(source.trim()) : null;

    if (heading) {
      while (
        headingStack.length > 0 &&
        headingStack[headingStack.length - 1]!.level >= heading.level
      ) {
        headingStack.pop();
      }
    }

    let parent: OutlineNode | null = null;

    if (heading) {
      parent =
        heading.level === 1
          ? root
          : headingStack[headingStack.length - 1]?.node ?? null;
    } else {
      parent = headingStack[headingStack.length - 1]?.node ?? null;
    }

    if (!parent) {
      return;
    }

    const node: OutlineNode = {
      id: `cell-${cellIndex}`,
      cellIndex,
      headingLevel: heading?.level ?? null,
      title: cellTitle(cell, cellIndex),
      children: [],
    };

    parent.children.push(node);

    if (heading) {
      headingStack.push({ level: heading.level, node });
    }
  });

  return root;
};
