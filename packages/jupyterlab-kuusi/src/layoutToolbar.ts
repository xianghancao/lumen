import type { KuusiTranslator } from "./kuusiI18n";
import {
  LAYOUT_CHILD_GAP,
  LAYOUT_SIBLING_GAP,
  type LayoutDensity,
} from "kuusi-kernel";
import { closeKuusiDropdownMenus, createDropdownOptionRow } from "./formatToolbar";

export type LayoutSpacingState = {
  density: LayoutDensity;
  siblingGap: number;
  childGap: number;
};

const getLayoutDensities = (
  t: KuusiTranslator,
): Array<{
  value: LayoutDensity;
  label: string;
  title: string;
  previewClass: string;
}> => [
  {
    value: "compact",
    label: "Compact",
    title: t.compactLayout(),
    previewClass: "jp-KuusiLayoutDropdown-preview-compact",
  },
  {
    value: "normal",
    label: "Normal",
    title: t.normalLayout(),
    previewClass: "jp-KuusiLayoutDropdown-preview-normal",
  },
  {
    value: "loose",
    label: "Loose",
    title: t.looseLayout(),
    previewClass: "jp-KuusiLayoutDropdown-preview-loose",
  },
];

const appendGapSlider = (
  menu: HTMLElement,
  label: string,
  value: number,
  min: number,
  max: number,
  onChange: (value: number) => void,
): void => {
  const section = document.createElement("div");
  section.className = "jp-KuusiLayoutDropdown-gapSection";

  const header = document.createElement("div");
  header.className = "jp-KuusiLayoutDropdown-gapHeader";

  const labelEl = document.createElement("span");
  labelEl.className = "jp-KuusiLayoutDropdown-gapLabel";
  labelEl.textContent = label;

  const valueEl = document.createElement("span");
  valueEl.className = "jp-KuusiLayoutDropdown-gapValue";
  valueEl.textContent = String(value);

  const slider = document.createElement("input");
  slider.type = "range";
  slider.className = "jp-KuusiLayoutDropdown-gapSlider";
  slider.min = String(min);
  slider.max = String(max);
  slider.step = "1";
  slider.value = String(value);
  slider.setAttribute("aria-label", label);
  slider.title = label;

  slider.addEventListener("input", () => {
    const nextValue = Number(slider.value);
    valueEl.textContent = String(nextValue);
    onChange(nextValue);
  });
  slider.addEventListener("mousedown", (event) => {
    event.stopPropagation();
  });
  slider.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  header.append(labelEl, valueEl);
  section.append(header, slider);
  menu.appendChild(section);
};

export const createLayoutToolbar = (
  root: HTMLElement,
  getState: () => LayoutSpacingState,
  onDensityChange: (density: LayoutDensity) => void,
  onGapChange: (gaps: { siblingGap?: number; childGap?: number }) => void,
  t: KuusiTranslator,
): HTMLElement => {
  const toolbar = document.createElement("div");
  toolbar.className = "jp-KuusiNotebookMindMap-layout-toolbar";

  const dropdown = document.createElement("div");
  dropdown.className = "jp-KuusiFormatDropdown jp-KuusiLayoutDropdown";

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className =
    "jp-KuusiNotebookMindMap-format-btn jp-KuusiLayoutDropdown-trigger";
  trigger.setAttribute("aria-haspopup", "menu");
  trigger.setAttribute("aria-label", t.nodeLayoutSpacing());
  trigger.title = t.nodeLayoutSpacing();
  trigger.textContent = t.layout();

  const menu = document.createElement("div");
  menu.className =
    "jp-KuusiFormatDropdown-menu jp-KuusiLayoutDropdown-menu";
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-label", t.nodeLayoutSpacing());

  const rebuildMenu = () => {
    menu.replaceChildren();
    const row = createDropdownOptionRow(menu);
    getLayoutDensities(t).forEach(({ value, label, title, previewClass }) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className =
        "jp-KuusiFormatDropdown-item jp-KuusiLayoutDropdown-item";
      item.setAttribute("role", "menuitem");
      item.setAttribute("aria-label", title);
      item.title = title;
      item.classList.toggle("is-active", getState().density === value);

      const labelEl = document.createElement("span");
      labelEl.className = "jp-KuusiLayoutDropdown-label";
      labelEl.textContent = label;
      item.appendChild(labelEl);

      const preview = document.createElement("span");
      preview.className = `jp-KuusiLayoutDropdown-preview ${previewClass}`;
      preview.setAttribute("aria-hidden", "true");

      for (let index = 0; index < 3; index += 1) {
        const bar = document.createElement("span");
        bar.className = "jp-KuusiLayoutDropdown-previewBar";
        preview.appendChild(bar);
      }

      item.appendChild(preview);

      item.addEventListener("click", (event) => {
        event.stopPropagation();
        onDensityChange(value);
        rebuildMenu();
      });
      row.appendChild(item);
    });

    const state = getState();
    appendGapSlider(
      menu,
      t.siblingGap(),
      state.siblingGap,
      LAYOUT_SIBLING_GAP.min,
      LAYOUT_SIBLING_GAP.max,
      (siblingGap) => {
        onGapChange({ siblingGap });
      },
    );
    appendGapSlider(
      menu,
      t.childGap(),
      state.childGap,
      LAYOUT_CHILD_GAP.min,
      LAYOUT_CHILD_GAP.max,
      (childGap) => {
        onGapChange({ childGap });
      },
    );
  };

  rebuildMenu();

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = menu.classList.contains("is-open");
    closeKuusiDropdownMenus(root);

    if (!isOpen) {
      rebuildMenu();
      menu.classList.add("is-open");
    }
  });

  document.addEventListener("click", () => {
    closeKuusiDropdownMenus(root);
  });

  dropdown.append(trigger, menu);
  toolbar.appendChild(dropdown);

  return toolbar;
};
