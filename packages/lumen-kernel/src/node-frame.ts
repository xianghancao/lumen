import type { NotebookCell } from "./types";

/** Per-node frame overrides stored in cell metadata (`metadata.lumen`). */
export type LumenNodeMetadata = {
  /** Outline heading level when the cell has no markdown `#` prefix. */
  headingLevel?: number;
  /** Named frame preset, e.g. `default`, `code`, or `heading-2`. */
  frame?: string;
  /** Inline CSS variable overrides for the node frame. */
  frameStyle?: NodeFrameStyle;
};

/** CSS custom properties applied on `.jp-LumenNotebookMindMap-cellNode`. */
export type NodeFrameStyle = {
  borderWidth?: string;
  borderColor?: string;
  borderRadius?: string;
  background?: string;
  boxShadow?: string;
};

const FRAME_STYLE_VAR_MAP: Record<keyof NodeFrameStyle, string> = {
  borderWidth: "--lumen-node-border-width",
  borderColor: "--lumen-node-border-color",
  borderRadius: "--lumen-node-border-radius",
  background: "--lumen-node-background",
  boxShadow: "--lumen-node-shadow",
};

export const getLumenNodeMetadata = (
  cell: NotebookCell,
): LumenNodeMetadata | undefined => {
  const lumen = cell.metadata?.lumen;

  if (!lumen || typeof lumen !== "object") {
    return undefined;
  }

  return lumen as LumenNodeMetadata;
};

export const resolveNodeFramePreset = (
  cell: NotebookCell,
  headingLevel: number | null,
): string => {
  const metadata = getLumenNodeMetadata(cell);

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
  const metadata = getLumenNodeMetadata(cell);
  const preset = resolveNodeFramePreset(cell, headingLevel);

  element.dataset.lumenFrame = preset;

  if (headingLevel !== null) {
    element.dataset.lumenHeadingLevel = String(headingLevel);
  } else {
    delete element.dataset.lumenHeadingLevel;
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
