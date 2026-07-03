import dagre from "dagre";
import type {
  LayoutDensity,
  LayoutOptions,
  LayoutPosition,
  OutlineEdge,
  OutlineNode,
  TreeDirection,
} from "./types";

const NODE_WIDTH = 520;
const NODE_HEIGHT = 160;
const NODE_LAYOUT_PADDING = 24;

export const DEFAULT_NODE_LAYOUT_SIZE = {
  width: NODE_WIDTH,
  height: NODE_HEIGHT,
} as const;

const getNodeSize = (
  nodeId: string,
  dimensions: LayoutOptions["nodeDimensions"],
): { width: number; height: number } => {
  const measured = dimensions?.get(nodeId);

  if (!measured) {
    return { width: NODE_WIDTH, height: NODE_HEIGHT };
  }

  return {
    width: Math.max(measured.width, NODE_WIDTH),
    height: Math.max(measured.height + NODE_LAYOUT_PADDING, NODE_HEIGHT),
  };
};

const DENSITY_SPACING: Record<
  LayoutDensity,
  {
    nodesepWhenHorizontal: number;
    ranksepWhenHorizontal: number;
    nodesepWhenVertical: number;
    ranksepWhenVertical: number;
    margin: number;
  }
> = {
  compact: {
    nodesepWhenHorizontal: 40,
    ranksepWhenHorizontal: 28,
    nodesepWhenVertical: 28,
    ranksepWhenVertical: 40,
    margin: 20,
  },
  normal: {
    nodesepWhenHorizontal: 72,
    ranksepWhenHorizontal: 48,
    nodesepWhenVertical: 48,
    ranksepWhenVertical: 72,
    margin: 32,
  },
  loose: {
    nodesepWhenHorizontal: 108,
    ranksepWhenHorizontal: 72,
    nodesepWhenVertical: 72,
    ranksepWhenVertical: 108,
    margin: 48,
  },
};

/** Top-level layout nodes: the H1 root cell(s), not the virtual outline root. */
const getLayoutRoots = (root: OutlineNode): OutlineNode[] =>
  root.cellIndex !== null ? [root] : root.children;

const visit = (
  node: OutlineNode,
  parentId: string | null,
  graph: dagre.graphlib.Graph,
  collapsedIds: ReadonlySet<string>,
  nodeDimensions: LayoutOptions["nodeDimensions"],
) => {
  const size = getNodeSize(node.id, nodeDimensions);

  graph.setNode(node.id, {
    width: size.width,
    height: size.height,
    label: node.title,
  });

  if (parentId) {
    graph.setEdge(parentId, node.id);
  }

  if (collapsedIds.has(node.id)) {
    return;
  }

  node.children.forEach((child) =>
    visit(child, node.id, graph, collapsedIds, nodeDimensions),
  );
};

/** Assign x/y positions to outline nodes. */
export const layoutOutlineTree = (
  root: OutlineNode,
  options: LayoutOptions = {},
): LayoutPosition[] => {
  const direction: TreeDirection = options.direction ?? "LR";
  const isHorizontal = direction === "LR" || direction === "RL";
  const collapsedIds = options.collapsedIds ?? new Set<string>();
  const density: LayoutDensity = options.density ?? "normal";
  const spacing = DENSITY_SPACING[density];
  const nodeDimensions = options.nodeDimensions;
  const graph = new dagre.graphlib.Graph();

  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: direction,
    nodesep: isHorizontal
      ? spacing.nodesepWhenHorizontal
      : spacing.nodesepWhenVertical,
    ranksep: isHorizontal
      ? spacing.ranksepWhenHorizontal
      : spacing.ranksepWhenVertical,
    marginx: spacing.margin,
    marginy: spacing.margin,
  });

  getLayoutRoots(root).forEach((child) =>
    visit(child, null, graph, collapsedIds, nodeDimensions),
  );
  dagre.layout(graph);

  return graph.nodes().map((id) => {
    const positioned = graph.node(id);

    return {
      id,
      x: positioned.x - positioned.width / 2,
      y: positioned.y - positioned.height / 2,
      width: positioned.width,
      height: positioned.height,
    };
  });
};

/** Parent → child links for drawing canvas edges. */
export const collectOutlineEdges = (
  root: OutlineNode,
  collapsedIds: ReadonlySet<string> = new Set(),
): OutlineEdge[] => {
  const edges: OutlineEdge[] = [];

  const visit = (node: OutlineNode, parentId: string | null) => {
    if (parentId) {
      edges.push({ fromId: parentId, toId: node.id });
    }

    if (collapsedIds.has(node.id)) {
      return;
    }

    node.children.forEach((child) => visit(child, node.id));
  };

  getLayoutRoots(root).forEach((child) => visit(child, null));
  return edges;
};

const horizontalCenter = (node: LayoutPosition, edge: "left" | "right") => ({
  x: edge === "left" ? node.x : node.x + node.width,
  y: node.y + node.height / 2,
});

const verticalCenter = (node: LayoutPosition, edge: "top" | "bottom") => ({
  x: node.x + node.width / 2,
  y: edge === "top" ? node.y : node.y + node.height,
});

const getEdgeAnchors = (
  from: LayoutPosition,
  to: LayoutPosition,
  direction: TreeDirection,
): {
  fromPoint: { x: number; y: number };
  toPoint: { x: number; y: number };
} => {
  switch (direction) {
    case "LR":
      return {
        fromPoint: horizontalCenter(from, "right"),
        toPoint: horizontalCenter(to, "left"),
      };
    case "RL":
      return {
        fromPoint: horizontalCenter(from, "left"),
        toPoint: horizontalCenter(to, "right"),
      };
    case "BT":
      return {
        fromPoint: verticalCenter(from, "top"),
        toPoint: verticalCenter(to, "bottom"),
      };
    case "TB":
    default:
      return {
        fromPoint: verticalCenter(from, "bottom"),
        toPoint: verticalCenter(to, "top"),
      };
  }
};

/** SVG path between parent and child nodes for the given tree direction. */
export const buildMindMapEdgePath = (
  from: LayoutPosition,
  to: LayoutPosition,
  direction: TreeDirection = "TB",
): string => {
  const { fromPoint, toPoint } = getEdgeAnchors(from, to, direction);

  switch (direction) {
    case "BT": {
      const midY = fromPoint.y + (toPoint.y - fromPoint.y) / 2;

      return `M ${fromPoint.x} ${fromPoint.y} C ${fromPoint.x} ${midY}, ${toPoint.x} ${midY}, ${toPoint.x} ${toPoint.y}`;
    }
    case "LR": {
      const midX = fromPoint.x + (toPoint.x - fromPoint.x) / 2;

      return `M ${fromPoint.x} ${fromPoint.y} C ${midX} ${fromPoint.y}, ${midX} ${toPoint.y}, ${toPoint.x} ${toPoint.y}`;
    }
    case "RL": {
      const midX = fromPoint.x + (toPoint.x - fromPoint.x) / 2;

      return `M ${fromPoint.x} ${fromPoint.y} C ${midX} ${fromPoint.y}, ${midX} ${toPoint.y}, ${toPoint.x} ${toPoint.y}`;
    }
    case "TB":
    default: {
      const midY = fromPoint.y + (toPoint.y - fromPoint.y) / 2;

      return `M ${fromPoint.x} ${fromPoint.y} C ${fromPoint.x} ${midY}, ${toPoint.x} ${midY}, ${toPoint.x} ${toPoint.y}`;
    }
  }
};
