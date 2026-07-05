import type { NotebookCell } from "./types";

/** Per-node frame overrides stored in cell metadata (`metadata.kuusi`). */
export type KuusiNodeMetadata = {
  /** Outline heading level when the cell has no markdown `#` prefix. */
  headingLevel?: number;
  /** Named frame preset, e.g. `default`, `code`, or `heading-2`. */
  frame?: string;
  /** Inline CSS variable overrides for the node frame. */
  frameStyle?: NodeFrameStyle;
};

/** CSS custom properties applied on `.jp-KuusiNotebookMindMap-cellNode`. */
export type NodeFrameStyle = {
  borderWidth?: string;
  borderColor?: string;
  borderRadius?: string;
  background?: string;
  boxShadow?: string;
};

const FRAME_STYLE_VAR_MAP: Record<keyof NodeFrameStyle, string> = {
  borderWidth: "--kuusi-node-border-width",
  borderColor: "--kuusi-node-border-color",
  borderRadius: "--kuusi-node-border-radius",
  background: "--kuusi-node-background",
  boxShadow: "--kuusi-node-shadow",
};

const readKuusiMetadata = (
  metadata: NotebookCell["metadata"],
): KuusiNodeMetadata | undefined => {
  const kuusi = metadata?.kuusi ?? metadata?.lumen;

  if (!kuusi || typeof kuusi !== "object") {
    return undefined;
  }

  return kuusi as KuusiNodeMetadata;
};

export const getKuusiNodeMetadata = (
  cell: NotebookCell,
): KuusiNodeMetadata | undefined => readKuusiMetadata(cell.metadata);

export const resolveNodeFramePreset = (
  cell: NotebookCell,
  headingLevel: number | null,
): string => {
  const metadata = getKuusiNodeMetadata(cell);

  if (metadata?.frame) {
    return metadata.frame;
  }

  if (headingLevel !== null) {
    return `heading-${headingLevel}`;
  }

  if (cell.cell_type === "code") {
    return "code";
  }

  return "default";
};

/** Apply frame preset + optional metadata overrides to a node element. */
export const applyNodeFrameToElement = (
  element: HTMLElement,
  cell: NotebookCell,
  headingLevel: number | null,
): void => {
  const metadata = getKuusiNodeMetadata(cell);
  const preset = resolveNodeFramePreset(cell, headingLevel);

  element.dataset.kuusiFrame = preset;

  if (headingLevel !== null) {
    element.dataset.kuusiHeadingLevel = String(headingLevel);
  } else {
    delete element.dataset.kuusiHeadingLevel;
  }

  Object.values(FRAME_STYLE_VAR_MAP).forEach((cssVar) => {
    element.style.removeProperty(cssVar);
  });

  const frameStyle = metadata?.frameStyle;

  if (!frameStyle) {
    return;
  }

  (Object.keys(FRAME_STYLE_VAR_MAP) as Array<keyof NodeFrameStyle>).forEach(
    (key) => {
      const value = frameStyle[key];

      if (typeof value === "string" && value.length > 0) {
        element.style.setProperty(FRAME_STYLE_VAR_MAP[key], value);
      }
    },
  );
};
