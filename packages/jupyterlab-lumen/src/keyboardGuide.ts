import type { LumenTranslator } from "./lumenI18n";

export type ShortcutGuideEntry = {
  keys: string;
  description: string;
};

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPod|iPhone|iPad/.test(navigator.platform);

export const modKeyLabel = isMac ? "⌘" : "Ctrl";

export const MIND_MAP_SHORTCUTS: ShortcutGuideEntry[] = [
  { keys: "↑ ↓", description: "Move between siblings" },
  { keys: "← →", description: "Move to parent / first child" },
  { keys: "Enter", description: "Insert sibling node" },
  { keys: "Shift+Enter", description: "Render node and insert sibling" },
  {
    keys: `${modKeyLabel}+Enter`,
    description: "Render node and stay on current node",
  },
  { keys: "Tab", description: "Insert child node" },
  { keys: `${modKeyLabel}+C`, description: "Copy" },
  { keys: `${modKeyLabel}+X`, description: "Cut" },
  { keys: `${modKeyLabel}+V`, description: "Paste" },
  { keys: `${modKeyLabel}+Z`, description: "Undo" },
  {
    keys: isMac ? `${modKeyLabel}+Shift+Z` : `${modKeyLabel}+Y`,
    description: "Redo",
  },
  { keys: "Delete", description: "Delete selected node" },
  { keys: "F2", description: "Edit current node" },
  { keys: "Escape", description: "Exit edit mode" },
  { keys: `${modKeyLabel}+Home`, description: "Jump to root (H1)" },
];

export const FORMAT_SHORTCUTS: ShortcutGuideEntry[] = [
  { keys: `${modKeyLabel}+B`, description: "Bold (toggle)" },
  { keys: `${modKeyLabel}+I`, description: "Italic (toggle)" },
  { keys: `${modKeyLabel}+U`, description: "Underline (toggle)" },
  { keys: `${modKeyLabel}+Shift+X`, description: "Strikethrough (toggle)" },
  { keys: `${modKeyLabel}+E`, description: "Inline code (toggle)" },
  { keys: `${modKeyLabel}+K`, description: "Insert Markdown link" },
  { keys: `${modKeyLabel}+Shift+K`, description: "Insert HTML link" },
  { keys: `${modKeyLabel}+Shift+M`, description: "Highlight (toggle)" },
  { keys: `${modKeyLabel}+\\`, description: "Clear formatting in selection" },
];

export const FORMAT_GUIDE_NOTES: ShortcutGuideEntry[] = [
  {
    keys: "Title",
    description: "Outline headings change the mind map tree (H1 = root)",
  },
  {
    keys: "Aa",
    description: "Inline styles only affect node content, not structure",
  },
  {
    keys: "Code cell",
    description: "Format toolbar is disabled while editing code cells",
  },
];

const appendGuideSection = (
  menu: HTMLElement,
  title: string,
  entries: ShortcutGuideEntry[],
): void => {
  const sectionTitle = document.createElement("div");
  sectionTitle.className = "jp-LumenGuideDropdown-title";
  sectionTitle.textContent = title;
  menu.appendChild(sectionTitle);

  entries.forEach(({ keys, description }) => {
    const row = document.createElement("div");
    row.className = "jp-LumenGuideDropdown-row";
    row.setAttribute("role", "menuitem");

    const keyEl = document.createElement("kbd");
    keyEl.className = "jp-LumenGuideDropdown-key";
    keyEl.textContent = keys;

    const descEl = document.createElement("span");
    descEl.className = "jp-LumenGuideDropdown-desc";
    descEl.textContent = description;

    row.append(keyEl, descEl);
    menu.appendChild(row);
  });
};

export const createGuideToolbar = (
  t: LumenTranslator,
  onOpenChange?: (open: boolean) => void,
): HTMLElement => {
  const toolbar = document.createElement("div");
  toolbar.className = "jp-LumenNotebookMindMap-guide-toolbar";

  const dropdown = document.createElement("div");
  dropdown.className = "jp-LumenFormatDropdown jp-LumenGuideDropdown";

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className =
    "jp-LumenNotebookMindMap-format-btn jp-LumenGuideDropdown-trigger";
  trigger.setAttribute("aria-haspopup", "menu");
  trigger.setAttribute("aria-label", t.keyboardShortcuts());
  trigger.title = t.keyboardShortcuts();
  trigger.textContent = t.guide();

  const menu = document.createElement("div");
  menu.className =
    "jp-LumenFormatDropdown-menu jp-LumenFormatDropdown-menu-wide jp-LumenGuideDropdown-menu";
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-label", t.keyboardShortcuts());

  appendGuideSection(menu, t.mindMapShortcuts(), MIND_MAP_SHORTCUTS);
  appendGuideSection(menu, t.formattingShortcuts(), FORMAT_SHORTCUTS);
  appendGuideSection(menu, t.formattingNotes(), FORMAT_GUIDE_NOTES);

  const setOpen = (open: boolean) => {
    menu.classList.toggle("is-open", open);
    onOpenChange?.(open);
  };

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    setOpen(!menu.classList.contains("is-open"));
  });

  document.addEventListener("click", () => {
    setOpen(false);
  });

  dropdown.append(trigger, menu);
  toolbar.appendChild(dropdown);

  return toolbar;
};

export const closeGuideMenu = (root: HTMLElement): void => {
  root
    .querySelector(".jp-LumenGuideDropdown-menu")
    ?.classList.remove("is-open");
};
