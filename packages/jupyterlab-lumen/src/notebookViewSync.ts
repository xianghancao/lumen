import type { NotebookPanel } from "@jupyterlab/notebook";
import type { NotebookMindMapTracker } from "./tracker";

const boundNotebookPanels = new WeakSet<NotebookPanel>();

export const bindNotebookToMindMapSync = (
  panel: NotebookPanel,
  mindMapTracker: NotebookMindMapTracker,
): void => {
  if (boundNotebookPanels.has(panel)) {
    return;
  }

  boundNotebookPanels.add(panel);

  const syncToMindMaps = () => {
    const cellIndex = panel.content.activeCellIndex;

    mindMapTracker.forEach((mindMapDoc) => {
      if (mindMapDoc.context.path === panel.context.path) {
        mindMapDoc.content.syncActiveCellFromNotebook(cellIndex);
      }
    });
  };

  panel.content.activeCellChanged.connect(syncToMindMaps);
};

export const syncNotebookPanelToMindMaps = (
  panel: NotebookPanel,
  mindMapTracker: NotebookMindMapTracker,
): void => {
  bindNotebookToMindMapSync(panel, mindMapTracker);

  const cellIndex = panel.content.activeCellIndex;

  mindMapTracker.forEach((mindMapDoc) => {
    if (mindMapDoc.context.path === panel.context.path) {
      mindMapDoc.content.syncActiveCellFromNotebook(cellIndex);
    }
  });
};
