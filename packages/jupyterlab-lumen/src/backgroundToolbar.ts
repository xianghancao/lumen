import { closeLumenDropdownMenus } from "./formatToolbar";

export type MindMapBackground =
  | "default"
  | "plain"
  | "grid"
  | "dots"
  | "gradient"
  | "eye-care"
  | "newspaper";

export const DEFAULT_MIND_MAP_BACKGROUND: MindMapBackground = "default";

const MIND_MAP_BACKGROUNDS: Array<{
  value: MindMapBackground;
  label: string;
  title: string;
}> = [
  {
    value: "default",
    label: "Default",
    title: "Follow the Jupyter theme background",
  },
  {
    value: "plain",
    label: "Plain",
    title: "Flat alternate background tone",
  },
  {
    value: "grid",
    label: "Grid",
    title: "Light grid lines for spatial reference",
  },
  {
    value: "dots",
    label: "Dots",
    title: "Dot pattern for spatial reference",
  },
  {
    value: "gradient",
    label: "Gradient",
    title: "Soft corner gradients",
  },
  {
    value: "eye-care",
    label: "护眼",
    title: "Soft green tint to reduce eye strain",
  },
  {
    value: "newspaper",
    label: "报纸",
    title: "Warm paper tone with a light newsprint texture",
  },
];

export const applyBackgroundToViewport = (
  viewport: HTMLElement,
  background: MindMapBackground,
): void => {
  viewport.dataset.lumenBackground = background;
};

export const createBackgroundToolbar = (
  root: HTMLElement,
  getBackground: () => MindMapBackground,
  onChange: (background: MindMapBackground) => void,
): HTMLElement => {
  const toolbar = document.createElement("div");
  toolbar.className = "jp-LumenNotebookMindMap-background-toolbar";

  const dropdown = document.createElement("div");
  dropdown.className = "jp-LumenFormatDropdown jp-LumenBackgroundDropdown";

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className =
    "jp-LumenNotebookMindMap-format-btn jp-LumenBackgroundDropdown-trigger";
  trigger.setAttribute("aria-haspopup", "menu");
  trigger.setAttribute("aria-label", "Canvas background");
  trigger.title = "Canvas background";
  trigger.textContent = "Background";

  const menu = document.createElement("div");
  menu.className =
    "jp-LumenFormatDropdown-menu jp-LumenBackgroundDropdown-menu";
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-label", "Canvas background");

  const rebuildMenu = () => {
    menu.replaceChildren(
      ...MIND_MAP_BACKGROUNDS.map(({ value, label, title }) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className =
          "jp-LumenFormatDropdown-item jp-LumenBackgroundDropdown-item";
        item.setAttribute("role", "menuitem");
        item.setAttribute("aria-label", title);
        item.title = title;
        item.textContent = label;
        item.classList.toggle("is-active", getBackground() === value);
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
