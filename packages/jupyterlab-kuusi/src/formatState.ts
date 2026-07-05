import type { CodeEditor } from "@jupyterlab/codeeditor";

export type ListFormatType =
  | "bulleted"
  | "dashed"
  | "numbered"
  | "checklist"
  | null;

export type FormatState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  inlineCode: boolean;
  highlight: boolean;
  blockQuote: boolean;
  headingLevel: number | null;
  listType: ListFormatType;
  color: string | null;
};

const getLineAtCursor = (editor: CodeEditor.IEditor): string => {
  const selection = editor.getSelection();
  return editor.getLine(selection.start.line) ?? "";
};

const isInsideWrap = (
  source: string,
  offset: number,
  before: string,
  after: string,
): boolean => {
  const windowStart = Math.max(0, offset - 240);
  const windowEnd = Math.min(source.length, offset + 240);
  const chunk = source.slice(windowStart, windowEnd);
  const relativeOffset = offset - windowStart;
  const openIndex = chunk.lastIndexOf(before, relativeOffset);

  if (openIndex < 0) {
    return false;
  }

  const closeIndex = chunk.indexOf(after, openIndex + before.length);

  if (closeIndex < 0 || closeIndex < relativeOffset) {
    return false;
  }

  return (
    relativeOffset >= openIndex + before.length && relativeOffset <= closeIndex
  );
};

const hasWrapAroundSelection = (
  source: string,
  start: number,
  end: number,
  before: string,
  after: string,
): boolean =>
  source.slice(start - before.length, start) === before &&
  source.slice(end, end + after.length) === after;

const isWrapActive = (
  editor: CodeEditor.IEditor,
  before: string,
  after: string,
): boolean => {
  const selection = editor.getSelection();
  const start = editor.getOffsetAt(selection.start);
  const end = editor.getOffsetAt(selection.end);
  const source = editor.model.sharedModel.getSource();

  if (start !== end) {
    return hasWrapAroundSelection(source, start, end, before, after);
  }

  return isInsideWrap(source, start, before, after);
};

const detectColor = (source: string, offset: number): string | null => {
  const windowStart = Math.max(0, offset - 120);
  const chunk = source.slice(windowStart, offset + 120);
  const relativeOffset = offset - windowStart;
  const openTag = '<span style="color:';
  const openIndex = chunk.lastIndexOf(openTag, relativeOffset);

  if (openIndex < 0) {
    return null;
  }

  const closeTag = "</span>";
  const styleEnd = chunk.indexOf('">', openIndex);

  if (styleEnd < 0) {
    return null;
  }

  const color = chunk.slice(openIndex + openTag.length, styleEnd);
  const closeIndex = chunk.indexOf(closeTag, styleEnd);

  if (closeIndex < 0 || closeIndex < relativeOffset) {
    return null;
  }

  return color;
};

const detectListType = (line: string): ListFormatType => {
  const trimmed = line.trimStart();

  if (/^[-*+]\s+\[[ xX]\]\s+/.test(trimmed)) {
    return "checklist";
  }

  if (/^\d+\.\s+/.test(trimmed)) {
    return "numbered";
  }

  if (/^–\s+/.test(trimmed)) {
    return "dashed";
  }

  if (/^[-*+]\s+/.test(trimmed)) {
    return "bulleted";
  }

  return null;
};

export const getFormatState = (
  editor: CodeEditor.IEditor | null | undefined,
  metadataHeadingLevel: number | null = null,
): FormatState => {
  const empty: FormatState = {
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    inlineCode: false,
    highlight: false,
    blockQuote: false,
    headingLevel: null,
    listType: null,
    color: null,
  };

  if (!editor) {
    return empty;
  }

  const selection = editor.getSelection();
  const offset = editor.getOffsetAt(selection.start);
  const source = editor.model.sharedModel.getSource();
  const line = getLineAtCursor(editor);
  const trimmed = line.trimStart();
  const headingMatch = trimmed.match(/^(#{1,6})(?:\s+(.*))?$/);

  return {
    bold: isWrapActive(editor, "**", "**"),
    italic: isWrapActive(editor, "*", "*"),
    underline: isWrapActive(editor, "<u>", "</u>"),
    strikethrough: isWrapActive(editor, "~~", "~~"),
    inlineCode: isWrapActive(editor, "`", "`"),
    highlight: isWrapActive(editor, "<mark>", "</mark>"),
    blockQuote: trimmed.startsWith("> "),
    headingLevel: headingMatch?.[1]
      ? headingMatch[1].length
      : metadataHeadingLevel,
    listType: detectListType(line),
    color: detectColor(source, offset),
  };
};
