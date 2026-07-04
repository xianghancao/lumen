import type { LumenTranslator } from "./lumenI18n";
import { closeLumenDropdownMenus, createDropdownOptionRow } from "./formatToolbar";

export type MindMapTheme = "classic" | "soft" | "contrast";

export const DEFAULT_MIND_MAP_THEME: MindMapTheme = "classic";

const MIND_MAP_THEMES: Array<{
  value: MindMapTheme;
  label: string;
  title: string;
}> = [
  {
    value: "classic",
    label: "Classic",
    title: "Balanced Jupyter-style nodes and connectors",
  },
  {
    value: "soft",
    label: "Soft",
    title: "Rounded cards with lighter borders and shadows",
  },
  {
    value: "contrast",
    label: "Contrast",
    title: "Stronger borders and connectors for clarity",
  },
];

export const applyThemeToScene = (
  scene: HTMLElement,
  theme: MindMapTheme,
): void => {
  scene.dataset.lumenTheme = theme;
};

export const createStyleToolbar = (
  root: HTMLElement,
  getTheme: () => MindMapTheme,
  onChange: (theme: MindMapTheme) => void,
  t: LumenTranslator,
): HTMLElement => {
  const toolbar = document.createElement("div");
  toolbar.className = "jp-LumenNotebookMindMap-style-toolbar";

  const dropdown = document.createElement("div");
  dropdown.className = "jp-LumenFormatDropdown jp-LumenStyleDropdown";

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className =
    "jp-LumenNotebookMindMap-format-btn jp-LumenStyleDropdown-trigger";
  trigger.setAttribute("aria-haspopup", "menu");
  trigger.setAttribute("aria-label", t.mindMapTheme());
  trigger.title = t.mindMapTheme();
  trigger.textContent = t.style();

  const menu = document.createElement("div");
  menu.className =
    "jp-LumenFormatDropdown-menu jp-LumenStyleDropdown-menu";
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-label", t.mindMapTheme());

  const rebuildMenu = () => {
    menu.replaceChildren();
    const row = createDropdownOptionRow(menu);
    MIND_MAP_THEMES.forEach(({ value, label, title }) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "jp-LumenFormatDropdown-item jp-LumenStyleDropdown-item";
      item.setAttribute("role", "menuitem");
      item.setAttribute("aria-label", title);
      item.title = title;
      item.textContent = label;
      item.classList.toggle("is-active", getTheme() === value);
      item.addEventListener("click", (event) => {
        event.stopPropagation();
        onChange(value);
        rebuildMenu();
      });
      row.appendChild(item);
    });
  };

  rebuildMenu();

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = menu.classList.contains("is-open");
    closeLumenDropdownMenus(root);

    if (!isOpen) {
      menu.classList.add("is-open");
    }
  });

  document.addEventListener("click", () => {
    closeLumenDropdownMenus(root);
  });

  dropdown.append(trigger, menu);
  toolbar.appendChild(dropdown);

  return toolbar;
};
