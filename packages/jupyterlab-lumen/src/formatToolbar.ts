import type { CodeEditor } from "@jupyterlab/codeeditor";
import { MarkdownFormat } from "./markdownFormat";

type EditorGetter = () => CodeEditor.IEditor | null | undefined;

type FormatToolbarOptions = {
  getEditor: EditorGetter;
  isEnabled: () => boolean;
};

export type FormatToolbarHandle = {
  node: HTMLElement;
  syncEnabled: () => void;
};

type MenuItem = {
  label: string;
  title?: string;
  action: (editor: CodeEditor.IEditor) => void;
};

const COLOR_SWATCHES = [
  { label: "Red", color: "#d32f2f" },
  { label: "Orange", color: "#f57c00" },
  { label: "Green", color: "#388e3c" },
  { label: "Blue", color: "#1976d2" },
  { label: "Purple", color: "#7b1fa2" },
  { label: "Gray", color: "#616161" },
];

const runOnEditor = (
  getEditor: EditorGetter,
  action: (editor: CodeEditor.IEditor) => void,
): void => {
  const editor = getEditor();

  if (!editor) {
    return;
  }

  action(editor);
};

const closeAllMenus = (root: HTMLElement): void => {
  root.querySelectorAll(".jp-LumenFormatDropdown-menu").forEach((menu) => {
    menu.classList.remove("is-open");
  });
};

export const closeLumenDropdownMenus = closeAllMenus;

const setButtonEnabled = (button: HTMLButtonElement, enabled: boolean): void => {
  button.disabled = !enabled;
  button.setAttribute("aria-disabled", String(!enabled));
};

const createDropdown = (
  getEditor: EditorGetter,
  label: string,
  title: string,
  items: MenuItem[],
  root: HTMLElement,
  registerControl: (button: HTMLButtonElement) => void,
): HTMLElement => {
  const wrapper = document.createElement("div");
  wrapper.className = "jp-LumenFormatDropdown";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "jp-LumenNotebookMindMap-format-btn";
  button.title = title;
  button.setAttribute("aria-label", title);
  button.setAttribute("aria-haspopup", "menu");
  button.textContent = label;
  registerControl(button);

  const menu = document.createElement("div");
  menu.className = "jp-LumenFormatDropdown-menu";
  menu.setAttribute("role", "menu");

  items.forEach((item) => {
    const menuItem = document.createElement("button");
    menuItem.type = "button";
    menuItem.className = "jp-LumenFormatDropdown-item";
    menuItem.setAttribute("role", "menuitem");
    menuItem.textContent = item.label;
    menuItem.title = item.title ?? item.label;
    menuItem.addEventListener("click", (event) => {
      event.stopPropagation();
      runOnEditor(getEditor, item.action);
      closeAllMenus(root);
    });
    menu.appendChild(menuItem);
  });

  button.addEventListener("click", (event) => {
    event.stopPropagation();

    if (button.disabled) {
      return;
    }

    const isOpen = menu.classList.contains("is-open");
    closeAllMenus(root);

    if (!isOpen) {
      menu.classList.add("is-open");
    }
  });

  wrapper.appendChild(button);
  wrapper.appendChild(menu);

  return wrapper;
};

const createColorDropdown = (
  getEditor: EditorGetter,
  root: HTMLElement,
  registerControl: (button: HTMLButtonElement) => void,
): HTMLElement => {
  const wrapper = document.createElement("div");
  wrapper.className = "jp-LumenFormatDropdown";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "jp-LumenNotebookMindMap-format-btn";
  button.title = "Text style";
  button.setAttribute("aria-label", "Text style");
  button.setAttribute("aria-haspopup", "menu");
  button.textContent = "Aa";
  registerControl(button);

  const menu = document.createElement("div");
  menu.className = "jp-LumenFormatDropdown-menu jp-LumenFormatDropdown-menu-wide";
  menu.setAttribute("role", "menu");

  const textItems: MenuItem[] = [
    { label: "Bold", action: MarkdownFormat.bold },
    { label: "Italic", action: MarkdownFormat.italic },
    { label: "Underline", action: MarkdownFormat.underline },
    { label: "Strikethrough", action: MarkdownFormat.strikethrough },
    { label: "Block Quote", action: MarkdownFormat.blockQuote },
  ];

  textItems.forEach((item) => {
    const menuItem = document.createElement("button");
    menuItem.type = "button";
    menuItem.className = "jp-LumenFormatDropdown-item";
    menuItem.setAttribute("role", "menuitem");
    menuItem.textContent = item.label;
    menuItem.addEventListener("click", (event) => {
      event.stopPropagation();
      runOnEditor(getEditor, item.action);
      closeAllMenus(root);
    });
    menu.appendChild(menuItem);
  });

  const colorLabel = document.createElement("div");
  colorLabel.className = "jp-LumenFormatDropdown-section";
  colorLabel.textContent = "Font color";
  menu.appendChild(colorLabel);

  const swatches = document.createElement("div");
  swatches.className = "jp-LumenFormatColorSwatches";

  COLOR_SWATCHES.forEach(({ label, color }) => {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "jp-LumenFormatColorSwatch";
    swatch.title = label;
    swatch.setAttribute("aria-label", label);
    swatch.style.backgroundColor = color;
    swatch.addEventListener("click", (event) => {
      event.stopPropagation();
      runOnEditor(getEditor, (editor) => MarkdownFormat.color(editor, color));
      closeAllMenus(root);
    });
    swatches.appendChild(swatch);
  });

  menu.appendChild(swatches);

  button.addEventListener("click", (event) => {
    event.stopPropagation();

    if (button.disabled) {
      return;
    }

    const isOpen = menu.classList.contains("is-open");
    closeAllMenus(root);

    if (!isOpen) {
      menu.classList.add("is-open");
    }
  });

  wrapper.appendChild(button);
  wrapper.appendChild(menu);

  return wrapper;
};

const createActionButton = (
  getEditor: EditorGetter,
  label: string,
  title: string,
  action: (editor: CodeEditor.IEditor) => void,
  registerControl: (button: HTMLButtonElement) => void,
): HTMLButtonElement => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "jp-LumenNotebookMindMap-format-btn";
  button.title = title;
  button.setAttribute("aria-label", title);
  button.textContent = label;
  registerControl(button);
  button.addEventListener("click", () => {
    if (button.disabled) {
      return;
    }

    runOnEditor(getEditor, action);
  });

  return button;
};

export const createFormatToolbar = ({
  getEditor,
  isEnabled,
}: FormatToolbarOptions): FormatToolbarHandle => {
  const toolbar = document.createElement("div");
  toolbar.className = "jp-LumenNotebookMindMap-format-toolbar";
  toolbar.setAttribute("role", "toolbar");
  toolbar.setAttribute("aria-label", "Markdown formatting");

  const controls: HTMLButtonElement[] = [];
  const registerControl = (button: HTMLButtonElement) => {
    controls.push(button);
  };

  const syncEnabled = () => {
    const enabled = isEnabled();

    controls.forEach((button) => {
      setButtonEnabled(button, enabled);
    });

    if (!enabled) {
      closeAllMenus(toolbar);
    }
  };

  document.addEventListener("click", () => {
    closeAllMenus(toolbar);
  });

  toolbar.appendChild(createColorDropdown(getEditor, toolbar, registerControl));

  toolbar.appendChild(
    createDropdown(
      getEditor,
      "Title",
      "Heading level",
      [
        { label: "Heading 1", action: MarkdownFormat.heading1 },
        { label: "Heading 2", action: MarkdownFormat.heading2 },
        { label: "Heading 3", action: MarkdownFormat.heading3 },
      ],
      toolbar,
      registerControl,
    ),
  );

  toolbar.appendChild(
    createDropdown(
      getEditor,
      "List",
      "List style",
      [
        { label: "Bulleted list", action: MarkdownFormat.bulletedList },
        { label: "Dashed list", action: MarkdownFormat.dashedList },
        { label: "Numbered list", action: MarkdownFormat.numberedList },
        { label: "Check list", action: MarkdownFormat.checkList },
      ],
      toolbar,
      registerControl,
    ),
  );

  toolbar.appendChild(
    createActionButton(
      getEditor,
      "Table",
      "Insert table",
      MarkdownFormat.table,
      registerControl,
    ),
  );
  toolbar.appendChild(
    createActionButton(
      getEditor,
      "Image",
      "Insert image",
      MarkdownFormat.image,
      registerControl,
    ),
  );
  toolbar.appendChild(
    createActionButton(
      getEditor,
      "Link",
      "Insert link",
      MarkdownFormat.link,
      registerControl,
    ),
  );

  syncEnabled();

  return { node: toolbar, syncEnabled };
};
