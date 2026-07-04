import type { CodeEditor } from "@jupyterlab/codeeditor";
import { MarkdownFormat } from "./markdownFormat";

export const handleFormatShortcut = (
  editor: CodeEditor.IEditor,
  event: KeyboardEvent,
): boolean => {
  const mod = event.metaKey || event.ctrlKey;

  if (!mod || event.altKey) {
    return false;
  }

  const key = event.key.toLowerCase();

  if (key === "b") {
    MarkdownFormat.bold(editor);
    return true;
  }

  if (key === "i") {
    MarkdownFormat.italic(editor);
    return true;
  }

  if (key === "u") {
    MarkdownFormat.underline(editor);
    return true;
  }

  if (key === "x" && event.shiftKey) {
    MarkdownFormat.strikethrough(editor);
    return true;
  }

  if (key === "e") {
    MarkdownFormat.inlineCode(editor);
    return true;
  }

  if (key === "k" && event.shiftKey) {
    MarkdownFormat.linkHtml(editor);
    return true;
  }

  if (key === "k") {
    MarkdownFormat.linkMarkdown(editor);
    return true;
  }

  if (key === "m" && event.shiftKey) {
    MarkdownFormat.highlight(editor);
    return true;
  }

  if (event.key === "\\") {
    MarkdownFormat.clearFormatting(editor);
    return true;
  }

  return false;
};
