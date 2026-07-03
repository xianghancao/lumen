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

export const createGuideToolbar = (
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
  trigger.setAttribute("aria-label", "Keyboard shortcuts");
  trigger.title = "Keyboard shortcuts";
  trigger.textContent = "Guide";

  const menu = document.createElement("div");
  menu.className =
    "jp-LumenFormatDropdown-menu jp-LumenFormatDropdown-menu-wide jp-LumenGuideDropdown-menu";
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-label", "Keyboard shortcuts");

  const title = document.createElement("div");
  title.className = "jp-LumenGuideDropdown-title";
  title.textContent = "Mind map shortcuts";
  menu.appendChild(title);

  MIND_MAP_SHORTCUTS.forEach(({ keys, description }) => {
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
