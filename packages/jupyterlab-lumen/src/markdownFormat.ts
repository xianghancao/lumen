import type { CodeEditor } from "@jupyterlab/codeeditor";

const getSelectedText = (editor: CodeEditor.IEditor): string => {
  const selection = editor.getSelection();
  const start = editor.getOffsetAt(selection.start);
  const end = editor.getOffsetAt(selection.end);

  return editor.model.sharedModel.getSource().slice(start, end);
};

const wrapSelection = (
  editor: CodeEditor.IEditor,
  before: string,
  after: string,
  placeholder = "text",
): void => {
  const selected = getSelectedText(editor);
  const content = selected || placeholder;

  editor.replaceSelection?.(`${before}${content}${after}`);
  editor.focus();
};

const prefixSelectedLines = (
  editor: CodeEditor.IEditor,
  prefix: string,
  stripPattern?: RegExp,
): void => {
  const selection = editor.getSelection();
  const startLine = Math.min(selection.start.line, selection.end.line);
  const endLine = Math.max(selection.start.line, selection.end.line);
  const source = editor.model.sharedModel.getSource();
  const lines = source.split("\n");

  for (let line = startLine; line <= endLine; line += 1) {
    const lineText = lines[line] ?? "";
    const trimmedStart = lineText.trimStart();
    const leading = lineText.slice(0, lineText.length - trimmedStart.length);
    const content = stripPattern
      ? trimmedStart.replace(stripPattern, "")
      : trimmedStart;
    lines[line] = `${leading}${prefix}${content}`;
  }

  editor.model.sharedModel.setSource(lines.join("\n"));
  editor.focus();
};

const applyNumberedList = (editor: CodeEditor.IEditor): void => {
  const selection = editor.getSelection();
  const startLine = Math.min(selection.start.line, selection.end.line);
  const endLine = Math.max(selection.start.line, selection.end.line);
  const source = editor.model.sharedModel.getSource();
  const lines = source.split("\n");
  let index = 1;

  for (let line = startLine; line <= endLine; line += 1) {
    const lineText = lines[line] ?? "";
    const content = lineText.replace(/^\s*(\d+\.\s+|[-*+]\s+(\[[ xX]\]\s+)?)/, "");
    const leading = lineText.slice(0, lineText.length - lineText.trimStart().length);
    lines[line] = `${leading}${index}. ${content.trimStart()}`;
    index += 1;
  }

  editor.model.sharedModel.setSource(lines.join("\n"));
  editor.focus();
};

const insertAtCursor = (editor: CodeEditor.IEditor, text: string): void => {
  editor.replaceSelection?.(text);
  editor.focus();
};

const applyHeading = (editor: CodeEditor.IEditor, level: number): void => {
  prefixSelectedLines(editor, `${"#".repeat(level)} `, /^#+\s+/);
};

export const MarkdownFormat = {
  bold: (editor: CodeEditor.IEditor) =>
    wrapSelection(editor, "**", "**"),
  italic: (editor: CodeEditor.IEditor) =>
    wrapSelection(editor, "*", "*"),
  underline: (editor: CodeEditor.IEditor) =>
    wrapSelection(editor, "<u>", "</u>"),
  strikethrough: (editor: CodeEditor.IEditor) =>
    wrapSelection(editor, "~~", "~~"),
  color: (editor: CodeEditor.IEditor, color: string) =>
    wrapSelection(editor, `<span style="color:${color}">`, "</span>"),
  blockQuote: (editor: CodeEditor.IEditor) =>
    prefixSelectedLines(editor, "> ", /^>\s+/),
  heading1: (editor: CodeEditor.IEditor) => applyHeading(editor, 1),
  heading2: (editor: CodeEditor.IEditor) => applyHeading(editor, 2),
  heading3: (editor: CodeEditor.IEditor) => applyHeading(editor, 3),
  bulletedList: (editor: CodeEditor.IEditor) =>
    prefixSelectedLines(editor, "- ", /^[-*+]\s+(\[[ xX]\]\s+)?/),
  dashedList: (editor: CodeEditor.IEditor) =>
    prefixSelectedLines(editor, "– ", /^[-*+–]\s+(\[[ xX]\]\s+)?/),
  numberedList: applyNumberedList,
  checkList: (editor: CodeEditor.IEditor) =>
    prefixSelectedLines(editor, "- [ ] ", /^[-*+]\s+(\[[ xX]\]\s+)?/),
  table: (editor: CodeEditor.IEditor) =>
    insertAtCursor(
      editor,
      "\n| Column 1 | Column 2 |\n| --- | --- |\n|  |  |\n",
    ),
  image: (editor: CodeEditor.IEditor) => {
    const alt = getSelectedText(editor) || "image";
    insertAtCursor(editor, `![${alt}](https://)`);
  },
  link: (editor: CodeEditor.IEditor) => {
    const label = getSelectedText(editor) || "link";
    insertAtCursor(editor, `[${label}](https://)`);
  },
};
