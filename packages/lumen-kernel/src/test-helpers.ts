import type { NotebookCell } from "./types";

export const md = (
  source: string,
  metadata?: Record<string, unknown>,
): NotebookCell => ({
  cell_type: "markdown",
  source,
  metadata,
});

export const code = (source: string): NotebookCell => ({
  cell_type: "code",
  source,
});
