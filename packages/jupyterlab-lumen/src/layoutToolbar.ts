import type { LayoutDensity } from "lumen-kernel";
import { closeLumenDropdownMenus } from "./formatToolbar";

const LAYOUT_DENSITIES: Array<{
  value: LayoutDensity;
  label: string;
  title: string;
}> = [
  { value: "compact", label: "Compact", title: "Tighter node spacing" },
  { value: "normal", label: "Normal", title: "Default node spacing" },
  { value: "loose", label: "Loose", title: "Wider node spacing" },
];

export const createLayoutToolbar = (
  root: HTMLElement,
  getDensity: () => LayoutDensity,
  onChange: (density: LayoutDensity) => void,
): HTMLElement => {
  const toolbar = document.createElement("div");
  toolbar.className = "jp-LumenNotebookMindMap-layout-toolbar";

  const dropdown = document.createElement("div");
  dropdown.className = "jp-LumenFormatDropdown jp-LumenLayoutDropdown";

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className =
    "jp-LumenNotebookMindMap-format-btn jp-LumenLayoutDropdown-trigger";
  trigger.setAttribute("aria-haspopup", "menu");
  trigger.setAttribute("aria-label", "Node layout spacing");
  trigger.title = "Node layout spacing";
  trigger.textContent = "Layout";

  const menu = document.createElement("div");
  menu.className =
    "jp-LumenFormatDropdown-menu jp-LumenLayoutDropdown-menu";
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-label", "Node layout spacing");

  const rebuildMenu = () => {
    menu.replaceChildren(
      ...LAYOUT_DENSITIES.map(({ value, label, title }) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "jp-LumenFormatDropdown-item jp-LumenLayoutDropdown-item";
        item.setAttribute("role", "menuitem");
        item.setAttribute("aria-label", title);
        item.title = title;
        item.textContent = label;
        item.classList.toggle("is-active", getDensity() === value);
        item.addEventListener("click", (event) => {
          event.stopPropagation();
          onChange(value);
          rebuildMenu();
          closeLumenDropdownMenus(root);
        });
        return item;
      }),
    );
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
