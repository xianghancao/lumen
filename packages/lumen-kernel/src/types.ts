export type NotebookCell = {
  cell_type: "code" | "markdown" | "raw";
  source: string | string[];
  metadata?: Record<string, unknown>;
};

export type NotebookContent = {
  cells: NotebookCell[];
};

export type OutlineNode = {
  /** Stable id for layout (`root`, `cell-0`, …) */
  id: string;
  /** Index into notebook.cells, or null for the virtual root */
  cellIndex: number | null;
  headingLevel: number | null;
  title: string;
  children: OutlineNode[];
};

export type LayoutPosition = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type OutlineEdge = {
  fromId: string;
  toId: string;
};

/** Dagre rank direction for the outline tree layout. */
export type TreeDirection = "TB" | "BT" | "LR" | "RL";

/** Spacing preset for mind map node layout. */
export type LayoutDensity = "compact" | "normal" | "loose";

export type LayoutOptions = {
  direction?: TreeDirection;
  /** Collapsed node ids — their descendants are omitted from layout. */
  collapsedIds?: ReadonlySet<string>;
  density?: LayoutDensity;
  /** Boundary gap between sibling nodes (maps to dagre nodesep). */
  siblingGap?: number;
  /** Boundary gap between parent and child nodes (maps to dagre ranksep). */
  childGap?: number;
  /** Measured node box sizes used by the layout engine. */
  nodeDimensions?: ReadonlyMap<string, { width: number; height: number }>;
};
