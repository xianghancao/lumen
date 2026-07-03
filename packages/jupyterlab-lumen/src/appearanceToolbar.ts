import { closeLumenDropdownMenus } from "./formatToolbar";

export type LineStyle = "solid" | "dashed" | "dotted";

export type AppearanceSettings = {
  edgeStyle: LineStyle;
  edgeWidth: string;
  edgeColor: string;
  nodeBorderStyle: LineStyle;
  nodeBorderWidth: string;
  nodeBorderColor: string;
};

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  edgeStyle: "solid",
  edgeWidth: "3pt",
  edgeColor: "",
  nodeBorderStyle: "solid",
  nodeBorderWidth: "1px",
  nodeBorderColor: "",
};

const COLOR_SWATCHES = [
  { label: "Default", color: "" },
  { label: "Red", color: "#d32f2f" },
  { label: "Orange", color: "#f57c00" },
  { label: "Green", color: "#388e3c" },
  { label: "Blue", color: "#1976d2" },
  { label: "Purple", color: "#7b1fa2" },
  { label: "Gray", color: "#616161" },
  { label: "Black", color: "#212121" },
];

const LINE_STYLES: Array<{ value: LineStyle; label: string }> = [
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
];

const EDGE_WIDTHS = ["1pt", "2pt", "3pt", "4pt", "5pt", "6pt", "8pt"];
const NODE_BORDER_WIDTHS = ["1px", "2px", "3px", "4px", "5px"];

export const applyAppearanceToScene = (
  scene: HTMLElement,
  settings: AppearanceSettings,
): void => {
  scene.dataset.lumenEdgeStyle = settings.edgeStyle;
  scene.dataset.lumenNodeBorderStyle = settings.nodeBorderStyle;

  const setVar = (name: string, value: string) => {
    if (value) {
      scene.style.setProperty(name, value);
    } else {
      scene.style.removeProperty(name);
    }
  };

  setVar("--lumen-edge-width", settings.edgeWidth);
  setVar("--lumen-edge-color", settings.edgeColor);
  setVar("--lumen-node-border-width", settings.nodeBorderWidth);
  setVar("--lumen-node-border-color", settings.nodeBorderColor);
};

const appendSection = (menu: HTMLElement, label: string): void => {
  const section = document.createElement("div");
  section.className = "jp-LumenFormatDropdown-section";
  section.textContent = label;
  menu.appendChild(section);
};

const appendOptionItems = (
  root: HTMLElement,
  menu: HTMLElement,
  items: Array<{ label: string; isActive?: boolean; onSelect: () => void }>,
): void => {
  items.forEach(({ label, isActive, onSelect }) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "jp-LumenFormatDropdown-item";
    item.setAttribute("role", "menuitem");
    item.textContent = label;
    item.classList.toggle("is-active", Boolean(isActive));
    item.addEventListener("click", (event) => {
      event.stopPropagation();
      onSelect();
      closeLumenDropdownMenus(root);
    });
    menu.appendChild(item);
  });
};

const appendColorSwatches = (
  root: HTMLElement,
  menu: HTMLElement,
  currentColor: string,
  onSelect: (color: string) => void,
): void => {
  const swatches = document.createElement("div");
  swatches.className = "jp-LumenFormatColorSwatches";

  COLOR_SWATCHES.forEach(({ label, color }) => {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "jp-LumenFormatColorSwatch";
    swatch.title = label;
    swatch.setAttribute("aria-label", label);
    swatch.classList.toggle("is-active", color === currentColor);

    if (color) {
      swatch.style.backgroundColor = color;
    } else {
      swatch.classList.add("jp-LumenFormatColorSwatch-default");
    }

    swatch.addEventListener("click", (event) => {
      event.stopPropagation();
      onSelect(color);
      closeLumenDropdownMenus(root);
    });
    swatches.appendChild(swatch);
  });

  menu.appendChild(swatches);
};

const createGroupedDropdown = (
  root: HTMLElement,
  buttonLabel: string,
  title: string,
  buildMenu: (menu: HTMLElement) => void,
): HTMLElement => {
  const wrapper = document.createElement("div");
  wrapper.className = "jp-LumenFormatDropdown jp-LumenAppearanceDropdown";

  const button = document.createElement("button");
  button.type = "button";
  button.className =
    "jp-LumenNotebookMindMap-format-btn jp-LumenAppearanceDropdown-btn";
  button.title = title;
  button.setAttribute("aria-label", title);
  button.setAttribute("aria-haspopup", "menu");
  button.textContent = buttonLabel;

  const menu = document.createElement("div");
  menu.className =
    "jp-LumenFormatDropdown-menu jp-LumenFormatDropdown-menu-wide jp-LumenAppearanceDropdown-menu";
  menu.setAttribute("role", "menu");
  buildMenu(menu);

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = menu.classList.contains("is-open");
    closeLumenDropdownMenus(root);

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
): HTMLElement => {
  const toolbar = document.createElement("div");
  toolbar.className = "jp-LumenNotebookMindMap-appearance-toolbar";
  toolbar.setAttribute("role", "toolbar");
  toolbar.setAttribute("aria-label", "Appearance");

  const patch = (partial: Partial<AppearanceSettings>) => {
    onChange({ ...getSettings(), ...partial });
  };

  const rebuild = () => {
    const settings = getSettings();

    toolbar.replaceChildren(
      createGroupedDropdown(root, "Line", "Connector line appearance", (menu) => {
        appendSection(menu, "Style");
        appendOptionItems(
          root,
          menu,
          LINE_STYLES.map(({ value, label }) => ({
            label,
            isActive: settings.edgeStyle === value,
            onSelect: () => {
              patch({ edgeStyle: value });
              rebuild();
            },
          })),
        );
        appendSection(menu, "Width");
        appendOptionItems(
          root,
          menu,
          EDGE_WIDTHS.map((width) => ({
            label: width,
            isActive: settings.edgeWidth === width,
            onSelect: () => {
              patch({ edgeWidth: width });
              rebuild();
            },
          })),
        );
        appendSection(menu, "Color");
        appendColorSwatches(root, menu, settings.edgeColor, (color) => {
          patch({ edgeColor: color });
          rebuild();
        });
      }),
      createGroupedDropdown(root, "Border", "Node border appearance", (menu) => {
        appendSection(menu, "Style");
        appendOptionItems(
          root,
          menu,
          LINE_STYLES.map(({ value, label }) => ({
            label,
            isActive: settings.nodeBorderStyle === value,
            onSelect: () => {
              patch({ nodeBorderStyle: value });
              rebuild();
            },
          })),
        );
        appendSection(menu, "Width");
        appendOptionItems(
          root,
          menu,
          NODE_BORDER_WIDTHS.map((width) => ({
            label: width,
            isActive: settings.nodeBorderWidth === width,
            onSelect: () => {
              patch({ nodeBorderWidth: width });
              rebuild();
            },
          })),
        );
        appendSection(menu, "Color");
        appendColorSwatches(root, menu, settings.nodeBorderColor, (color) => {
          patch({ nodeBorderColor: color });
          rebuild();
        });
      }),
    );
  };

  rebuild();

  document.addEventListener("click", () => {
    closeLumenDropdownMenus(root);
  });

  return toolbar;
};
