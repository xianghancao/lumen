import type { LumenTranslator } from "./lumenI18n";
import {
  appendDropdownSectionRow,
  closeLumenDropdownMenus,
} from "./formatToolbar";

export type MindMapFont =
  | "notebook"
  | "system-ui"
  | "arial"
  | "helvetica"
  | "segoe-ui"
  | "verdana"
  | "georgia"
  | "times"
  | "palatino"
  | "garamond"
  | "cambria";

export type MindMapFontSize =
  | "notebook"
  | "small"
  | "medium"
  | "large"
  | "extra-large";

export const DEFAULT_MIND_MAP_FONT: MindMapFont = "notebook";
export const DEFAULT_MIND_MAP_FONT_SIZE: MindMapFontSize = "notebook";

type FontCategory = "default" | "sans" | "serif";

type FontOption = {
  value: MindMapFont;
  label: string;
  title: string;
  category: FontCategory;
  previewFamily: string;
};

const FONT_OPTIONS: FontOption[] = [
  {
    value: "notebook",
    label: "Notebook",
    title: "Use the notebook default font",
    category: "default",
    previewFamily:
      'var(--jp-content-font-family, var(--jp-ui-font-family, system-ui))',
  },
  {
    value: "system-ui",
    label: "System UI",
    title: "System sans-serif UI font",
    category: "sans",
    previewFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  {
    value: "arial",
    label: "Arial",
    title: "Arial sans-serif",
    category: "sans",
    previewFamily: 'Arial, Helvetica, sans-serif',
  },
  {
    value: "helvetica",
    label: "Helvetica Neue",
    title: "Helvetica Neue sans-serif",
    category: "sans",
    previewFamily:
      '"Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  {
    value: "segoe-ui",
    label: "Segoe UI",
    title: "Segoe UI sans-serif",
    category: "sans",
    previewFamily: '"Segoe UI", Tahoma, sans-serif',
  },
  {
    value: "verdana",
    label: "Verdana",
    title: "Verdana sans-serif",
    category: "sans",
    previewFamily: "Verdana, Geneva, sans-serif",
  },
  {
    value: "georgia",
    label: "Georgia",
    title: "Georgia serif",
    category: "serif",
    previewFamily: "Georgia, serif",
  },
  {
    value: "times",
    label: "Times New Roman",
    title: "Times New Roman serif",
    category: "serif",
    previewFamily: '"Times New Roman", Times, serif',
  },
  {
    value: "palatino",
    label: "Palatino",
    title: "Palatino serif",
    category: "serif",
    previewFamily: '"Palatino Linotype", Palatino, serif',
  },
  {
    value: "garamond",
    label: "Garamond",
    title: "Garamond serif",
    category: "serif",
    previewFamily: 'Garamond, "Times New Roman", serif',
  },
  {
    value: "cambria",
    label: "Cambria",
    title: "Cambria serif",
    category: "serif",
    previewFamily: "Cambria, Georgia, serif",
  },
];

const FONT_SIZE_OPTIONS: Array<{
  value: MindMapFontSize;
  label: string;
  title: string;
  previewSize: string;
}> = [
  {
    value: "notebook",
    label: "Notebook",
    title: "Use the notebook default font size",
    previewSize: "var(--jp-content-font-size1, var(--jp-ui-font-size1))",
  },
  {
    value: "small",
    label: "Small",
    title: "Compact text for dense maps",
    previewSize: "0.85rem",
  },
  {
    value: "medium",
    label: "Medium",
    title: "Balanced reading size",
    previewSize: "1rem",
  },
  {
    value: "large",
    label: "Large",
    title: "Larger text for presentations",
    previewSize: "1.15rem",
  },
  {
    value: "extra-large",
    label: "Extra Large",
    title: "Maximum readability",
    previewSize: "1.3rem",
  },
];

const getSectionLabels = (t: LumenTranslator): Record<FontCategory, string> => ({
  default: t.fontSectionDefault(),
  sans: t.fontSectionSans(),
  serif: t.fontSectionSerif(),
});

export const applyFontToScene = (
  scene: HTMLElement,
  font: MindMapFont,
  fontSize: MindMapFontSize,
): void => {
  scene.dataset.lumenFont = font;
  scene.dataset.lumenFontSize = fontSize;
};

const createFontItem = (
  root: HTMLElement,
  option: FontOption,
  isActive: boolean,
  onSelect: () => void,
): HTMLButtonElement => {
  const item = document.createElement("button");
  item.type = "button";
  item.className =
    "jp-LumenFormatDropdown-item jp-LumenFontDropdown-item";
  item.setAttribute("role", "menuitem");
  item.title = option.title;
  item.classList.toggle("is-active", isActive);

  const label = document.createElement("span");
  label.className = "jp-LumenFontDropdown-label";
  label.textContent = option.label;
  item.appendChild(label);

  const preview = document.createElement("span");
  preview.className = "jp-LumenFontDropdown-preview";
  preview.style.fontFamily = option.previewFamily;
  preview.textContent = "Ag";
  preview.setAttribute("aria-hidden", "true");
  item.appendChild(preview);

  item.addEventListener("click", (event) => {
    event.stopPropagation();
    onSelect();
  });

  return item;
};

const createFontSizeItem = (
  root: HTMLElement,
  option: (typeof FONT_SIZE_OPTIONS)[number],
  isActive: boolean,
  onSelect: () => void,
): HTMLButtonElement => {
  const item = document.createElement("button");
  item.type = "button";
  item.className =
    "jp-LumenFormatDropdown-item jp-LumenFontDropdown-item jp-LumenFontDropdown-sizeItem";
  item.setAttribute("role", "menuitem");
  item.title = option.title;
  item.classList.toggle("is-active", isActive);

  const label = document.createElement("span");
  label.className = "jp-LumenFontDropdown-label";
  label.textContent = option.label;
  item.appendChild(label);

  const preview = document.createElement("span");
  preview.className = "jp-LumenFontDropdown-preview jp-LumenFontDropdown-sizePreview";
  preview.style.fontSize = option.previewSize;
  preview.textContent = "Aa";
  preview.setAttribute("aria-hidden", "true");
  item.appendChild(preview);

  item.addEventListener("click", (event) => {
    event.stopPropagation();
    onSelect();
  });

  return item;
};

export const createFontToolbar = (
  root: HTMLElement,
  getFont: () => MindMapFont,
  onFontChange: (font: MindMapFont) => void,
  getFontSize: () => MindMapFontSize,
  onFontSizeChange: (fontSize: MindMapFontSize) => void,
  t: LumenTranslator,
): HTMLElement => {
  const toolbar = document.createElement("div");
  toolbar.className = "jp-LumenNotebookMindMap-font-toolbar";

  const dropdown = document.createElement("div");
  dropdown.className = "jp-LumenFormatDropdown jp-LumenFontDropdown";

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className =
    "jp-LumenNotebookMindMap-format-btn jp-LumenFontDropdown-trigger";
  trigger.setAttribute("aria-haspopup", "menu");
  trigger.setAttribute("aria-label", t.mindMapFont());
  trigger.title = t.mindMapFont();
  trigger.textContent = t.font();

  const menu = document.createElement("div");
  menu.className =
    "jp-LumenFormatDropdown-menu jp-LumenFormatDropdown-menu-wide jp-LumenFontDropdown-menu";
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-label", t.mindMapFont());

  const rebuildMenu = () => {
    menu.replaceChildren();
    const sectionLabels = getSectionLabels(t);

    (["default", "sans", "serif"] as FontCategory[]).forEach((category) => {
      const options = FONT_OPTIONS.filter((option) => option.category === category);

      if (options.length === 0) {
        return;
      }

      const row = appendDropdownSectionRow(menu, sectionLabels[category]);
      options.forEach((option) => {
        row.appendChild(
          createFontItem(root, option, getFont() === option.value, () => {
            onFontChange(option.value);
            rebuildMenu();
          }),
        );
      });
    });

    const sizeRow = appendDropdownSectionRow(menu, t.fontSizeSection());
    FONT_SIZE_OPTIONS.forEach((option) => {
      sizeRow.appendChild(
        createFontSizeItem(
          root,
          option,
          getFontSize() === option.value,
          () => {
            onFontSizeChange(option.value);
            rebuildMenu();
          },
        ),
      );
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
