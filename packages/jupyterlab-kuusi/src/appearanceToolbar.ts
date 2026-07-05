import {
  APPEARANCE_COLOR_SWATCHES,
  appendColorPickerSection,
} from "./colorPicker";
import type { KuusiTranslator } from "./kuusiI18n";
import {
  appendDropdownSectionRow,
  closeKuusiDropdownMenus,
} from "./formatToolbar";

export type EdgeLineStyle =
  | "solid"
  | "dashed"
  | "dotted"
  | "long-dash"
  | "dash-dot"
  | "dense-dot"
  | "sparse-dash";

export type BorderLineStyle = "solid" | "dashed" | "dotted";

export type LineCap = "round" | "butt" | "square";

/** @deprecated Use EdgeLineStyle or BorderLineStyle */
export type LineStyle = EdgeLineStyle;

export type AppearanceSettings = {
  edgeStyle: EdgeLineStyle;
  edgeLinecap: LineCap;
  edgeWidth: string;
  edgeColor: string;
  nodeBorderStyle: BorderLineStyle;
  nodeBorderWidth: string;
  nodeBorderColor: string;
};

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  edgeStyle: "solid",
  edgeLinecap: "butt",
  edgeWidth: "3pt",
  edgeColor: "",
  nodeBorderStyle: "solid",
  nodeBorderWidth: "1px",
  nodeBorderColor: "",
};

const EDGE_LINE_STYLES: Array<{ value: EdgeLineStyle; label: string }> = [
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
  { value: "long-dash", label: "Long dash" },
  { value: "dash-dot", label: "Dash dot" },
  { value: "dense-dot", label: "Dense dot" },
  { value: "sparse-dash", label: "Sparse dash" },
];

const BORDER_LINE_STYLES: Array<{ value: BorderLineStyle; label: string }> = [
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
];

const LINE_CAPS: Array<{ value: LineCap; label: string }> = [
  { value: "round", label: "Round" },
  { value: "butt", label: "Flat" },
  { value: "square", label: "Square" },
];

const EDGE_WIDTHS = ["1pt", "2pt", "3pt", "4pt", "5pt", "6pt", "8pt"];
const NODE_BORDER_WIDTHS = ["1px", "2px", "3px", "4px", "5px"];

export const applyAppearanceToScene = (
  scene: HTMLElement,
  settings: AppearanceSettings,
): void => {
  scene.dataset.kuusiEdgeStyle = settings.edgeStyle;
  scene.dataset.kuusiEdgeLinecap = settings.edgeLinecap;
  scene.dataset.kuusiNodeBorderStyle = settings.nodeBorderStyle;

  const setVar = (name: string, value: string) => {
    if (value) {
      scene.style.setProperty(name, value);
    } else {
      scene.style.removeProperty(name);
    }
  };

  setVar("--kuusi-edge-width", settings.edgeWidth);
  setVar("--kuusi-edge-color", settings.edgeColor);
  setVar("--kuusi-node-border-width", settings.nodeBorderWidth);
  setVar("--kuusi-node-border-color", settings.nodeBorderColor);
};

const appendOptionItems = (
  root: HTMLElement,
  row: HTMLElement,
  items: Array<{
    label: string;
    isActive?: boolean;
    onSelect: () => void;
    preview?: HTMLElement;
  }>,
): void => {
  items.forEach(({ label, isActive, onSelect, preview }) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className =
      "jp-KuusiFormatDropdown-item jp-KuusiAppearanceOption-item";
    item.setAttribute("role", "menuitem");
    item.classList.toggle("is-active", Boolean(isActive));

    const labelEl = document.createElement("span");
    labelEl.className = "jp-KuusiAppearanceOption-label";
    labelEl.textContent = label;
    item.appendChild(labelEl);

    if (preview) {
      item.appendChild(preview);
    }

    item.addEventListener("click", (event) => {
      event.stopPropagation();
      onSelect();
    });
    row.appendChild(item);
  });
};

const createLineStylePreview = (style: EdgeLineStyle): HTMLElement => {
  const preview = document.createElement("span");
  preview.className = `jp-KuusiAppearancePreview jp-KuusiAppearancePreview-line-style is-${style}`;
  preview.setAttribute("aria-hidden", "true");
  return preview;
};

const createLineCapPreview = (cap: LineCap): HTMLElement => {
  const preview = document.createElement("span");
  preview.className = `jp-KuusiAppearancePreview jp-KuusiAppearancePreview-line-cap is-${cap}`;
  preview.setAttribute("aria-hidden", "true");

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "56");
  svg.setAttribute("height", "12");
  svg.setAttribute("viewBox", "0 0 56 12");

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", "4");
  line.setAttribute("y1", "6");
  line.setAttribute("x2", "52");
  line.setAttribute("y2", "6");
  line.setAttribute("stroke", "currentColor");
  line.setAttribute("stroke-width", "4");
  line.setAttribute("stroke-linecap", cap);

  svg.appendChild(line);
  preview.appendChild(svg);
  return preview;
};

const createLineWidthPreview = (width: string): HTMLElement => {
  const preview = document.createElement("span");
  preview.className = "jp-KuusiAppearancePreview jp-KuusiAppearancePreview-line-width";
  preview.style.setProperty("--kuusi-preview-line-width", width);
  preview.setAttribute("aria-hidden", "true");
  return preview;
};

const createBorderStylePreview = (style: BorderLineStyle): HTMLElement => {
  const preview = document.createElement("span");
  preview.className = `jp-KuusiAppearancePreview jp-KuusiAppearancePreview-border-style is-${style}`;
  preview.setAttribute("aria-hidden", "true");
  return preview;
};

const createBorderWidthPreview = (width: string): HTMLElement => {
  const preview = document.createElement("span");
  preview.className =
    "jp-KuusiAppearancePreview jp-KuusiAppearancePreview-border-width";
  preview.style.setProperty("--kuusi-preview-border-width", width);
  preview.setAttribute("aria-hidden", "true");
  return preview;
};

const appendAppearanceColorPicker = (
  menu: HTMLElement,
  sectionLabel: string,
  currentColor: string,
  onSelect: (color: string) => void,
  customInputId: string,
): void => {
  appendColorPickerSection(
    menu,
    sectionLabel,
    currentColor,
    onSelect,
    APPEARANCE_COLOR_SWATCHES,
    {
      includeDefaultSwatch: true,
      customInputId,
      customDefault: "#1976d2",
    },
  );
};

const createGroupedDropdown = (
  root: HTMLElement,
  buttonLabel: string,
  title: string,
  buildMenu: (menu: HTMLElement) => void,
): HTMLElement => {
  const wrapper = document.createElement("div");
  wrapper.className = "jp-KuusiFormatDropdown jp-KuusiAppearanceDropdown";

  const button = document.createElement("button");
  button.type = "button";
  button.className =
    "jp-KuusiNotebookMindMap-format-btn jp-KuusiAppearanceDropdown-btn";
  button.title = title;
  button.setAttribute("aria-label", title);
  button.setAttribute("aria-haspopup", "menu");
  button.textContent = buttonLabel;

  const menu = document.createElement("div");
  menu.className =
    "jp-KuusiFormatDropdown-menu jp-KuusiFormatDropdown-menu-wide jp-KuusiAppearanceDropdown-menu";
  menu.setAttribute("role", "menu");
  buildMenu(menu);

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = menu.classList.contains("is-open");
    closeKuusiDropdownMenus(root);

    if (!isOpen) {
      menu.classList.add("is-open");
    }
  });

  wrapper.append(button, menu);
  return wrapper;
};

export const createAppearanceToolbar = (
  root: HTMLElement,
  getSettings: () => AppearanceSettings,
  onChange: (settings: AppearanceSettings) => void,
  t: KuusiTranslator,
): HTMLElement => {
  const toolbar = document.createElement("div");
  toolbar.className = "jp-KuusiNotebookMindMap-appearance-toolbar";
  toolbar.setAttribute("role", "toolbar");
  toolbar.setAttribute("aria-label", t.appearance());

  const patch = (partial: Partial<AppearanceSettings>) => {
    onChange({ ...getSettings(), ...partial });
  };

  const rebuild = () => {
    const openMenuLabels = new Set(
      Array.from(toolbar.querySelectorAll(".jp-KuusiAppearanceDropdown-menu.is-open"))
        .map((menu) => menu.previousElementSibling)
        .filter((button): button is HTMLButtonElement => button instanceof HTMLButtonElement)
        .map((button) => button.getAttribute("aria-label"))
        .filter((label): label is string => Boolean(label)),
    );
    const settings = getSettings();

    toolbar.replaceChildren(
      createGroupedDropdown(root, t.line(), t.connectorLineAppearance(), (menu) => {
        appendOptionItems(
          root,
          appendDropdownSectionRow(menu, "Style"),
          EDGE_LINE_STYLES.map(({ value, label }) => ({
            label,
            isActive: settings.edgeStyle === value,
            preview: createLineStylePreview(value),
            onSelect: () => {
              patch({ edgeStyle: value });
              rebuild();
            },
          })),
        );
        appendOptionItems(
          root,
          appendDropdownSectionRow(menu, "Line cap"),
          LINE_CAPS.map(({ value, label }) => ({
            label,
            isActive: settings.edgeLinecap === value,
            preview: createLineCapPreview(value),
            onSelect: () => {
              patch({ edgeLinecap: value });
              rebuild();
            },
          })),
        );
        appendOptionItems(
          root,
          appendDropdownSectionRow(menu, "Width"),
          EDGE_WIDTHS.map((width) => ({
            label: width,
            isActive: settings.edgeWidth === width,
            preview: createLineWidthPreview(width),
            onSelect: () => {
              patch({ edgeWidth: width });
              rebuild();
            },
          })),
        );
        appendAppearanceColorPicker(
          menu,
          "Color",
          settings.edgeColor,
          (color) => {
            patch({ edgeColor: color });
            rebuild();
          },
          "jp-KuusiAppearanceEdgeColor-input",
        );
      }),
      createGroupedDropdown(root, "Border", t.nodeBorderAppearance(), (menu) => {
        appendOptionItems(
          root,
          appendDropdownSectionRow(menu, "Style"),
          BORDER_LINE_STYLES.map(({ value, label }) => ({
            label,
            isActive: settings.nodeBorderStyle === value,
            preview: createBorderStylePreview(value),
            onSelect: () => {
              patch({ nodeBorderStyle: value });
              rebuild();
            },
          })),
        );
        appendOptionItems(
          root,
          appendDropdownSectionRow(menu, "Width"),
          NODE_BORDER_WIDTHS.map((width) => ({
            label: width,
            isActive: settings.nodeBorderWidth === width,
            preview: createBorderWidthPreview(width),
            onSelect: () => {
              patch({ nodeBorderWidth: width });
              rebuild();
            },
          })),
        );
        appendAppearanceColorPicker(
          menu,
          "Color",
          settings.nodeBorderColor,
          (color) => {
            patch({ nodeBorderColor: color });
            rebuild();
          },
          "jp-KuusiAppearanceBorderColor-input",
        );
      }),
    );

    toolbar.querySelectorAll(".jp-KuusiAppearanceDropdown").forEach((wrapper) => {
      const button = wrapper.querySelector(".jp-KuusiAppearanceDropdown-btn");
      const menu = wrapper.querySelector(".jp-KuusiAppearanceDropdown-menu");
      const label = button?.getAttribute("aria-label");

      if (menu && label && openMenuLabels.has(label)) {
        menu.classList.add("is-open");
      }
    });
  };

  rebuild();

  document.addEventListener("click", () => {
    closeKuusiDropdownMenus(root);
  });

  return toolbar;
};
