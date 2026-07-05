import { WidgetTracker } from "@jupyterlab/apputils";
import type { NotebookMindMapDocumentWidget } from "./notebookMindMapWidget";

export class NotebookMindMapTracker extends WidgetTracker<NotebookMindMapDocumentWidget> {
  constructor() {
    super({
      namespace: "notebook-mindmap",
    });
  }
}
