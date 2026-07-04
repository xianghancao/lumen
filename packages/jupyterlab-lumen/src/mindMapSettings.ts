import type { ISettingRegistry } from "@jupyterlab/settingregistry";
import type { JSONValue } from "@lumino/coreutils";
import type { LayoutDensity, TreeDirection } from "lumen-kernel";
import { LAYOUT_CHILD_GAP, LAYOUT_SIBLING_GAP } from "lumen-kernel";
import {
  DEFAULT_APPEARANCE,
  type AppearanceSettings,
} from "./appearanceToolbar";
import { DEFAULT_MIND_MAP_BACKGROUND, DEFAULT_MIND_MAP_BACKGROUND_COLOR, type MindMapBackground } from "./backgroundToolbar";
import { DEFAULT_MIND_MAP_FONT, DEFAULT_MIND_MAP_FONT_SIZE, type MindMapFont, type MindMapFontSize } from "./fontToolbar";
import { DEFAULT_MIND_MAP_THEME, type MindMapTheme } from "./styleToolbar";

export const MIND_MAP_SETTINGS_PLUGIN_ID = "jupyterlab-lumen:plugin";

export type MindMapUserSettings = {
  theme: MindMapTheme;
  font: MindMapFont;
  fontSize: MindMapFontSize;
  layoutDensity: LayoutDensity;
  siblingGap: number;
  childGap: number;
  treeDirection: TreeDirection;
  background: MindMapBackground;
  backgroundColor: string;
  appearance: AppearanceSettings;
};

export const DEFAULT_MIND_MAP_USER_SETTINGS: MindMapUserSettings = {
  theme: DEFAULT_MIND_MAP_THEME,
  font: DEFAULT_MIND_MAP_FONT,
  fontSize: DEFAULT_MIND_MAP_FONT_SIZE,
  layoutDensity: "normal",
  siblingGap: LAYOUT_SIBLING_GAP.default,
  childGap: LAYOUT_CHILD_GAP.default,
  treeDirection: "LR",
  background: DEFAULT_MIND_MAP_BACKGROUND,
  backgroundColor: DEFAULT_MIND_MAP_BACKGROUND_COLOR,
  appearance: { ...DEFAULT_APPEARANCE },
};

const isTheme = (value: unknown): value is MindMapTheme =>
  value === "classic" || value === "soft" || value === "contrast";

const isFont = (value: unknown): value is MindMapFont =>
  value === "notebook" ||
  value === "system-ui" ||
  value === "arial" ||
  value === "helvetica" ||
  value === "segoe-ui" ||
  value === "verdana" ||
  value === "georgia" ||
  value === "times" ||
  value === "palatino" ||
  value === "garamond" ||
  value === "cambria";

const isFontSize = (value: unknown): value is MindMapFontSize =>
  value === "notebook" ||
  value === "small" ||
  value === "medium" ||
  value === "large" ||
  value === "extra-large";

const isLayoutDensity = (value: unknown): value is LayoutDensity =>
  value === "compact" || value === "normal" || value === "loose";

const clampLayoutGap = (
  value: unknown,
  spec: { min: number; max: number; default: number },
): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return spec.default;
  }

  return Math.min(spec.max, Math.max(spec.min, Math.round(value)));
};

const isTreeDirection = (value: unknown): value is TreeDirection =>
  value === "TB" || value === "BT" || value === "LR" || value === "RL";

const isBackground = (value: unknown): value is MindMapBackground =>
  value === "default" ||
  value === "plain" ||
  value === "grid" ||
  value === "dots" ||
  value === "gradient" ||
  value === "eye-care" ||
  value === "newspaper" ||
  value === "business-blue" ||
  value === "sea-blue" ||
  value === "tech-blue" ||
  value === "grass-green" ||
  value === "avocado" ||
  value === "stone-gray" ||
  value === "red-wall" ||
  value === "custom";

const normalizeBackground = (value: unknown): MindMapBackground =>
  isBackground(value) ? value : DEFAULT_MIND_MAP_BACKGROUND;

const isEdgeLineStyle = (
  value: unknown,
): value is AppearanceSettings["edgeStyle"] =>
  value === "solid" ||
  value === "dashed" ||
  value === "dotted" ||
  value === "long-dash" ||
  value === "dash-dot" ||
  value === "dense-dot" ||
  value === "sparse-dash";

const isBorderLineStyle = (
  value: unknown,
): value is AppearanceSettings["nodeBorderStyle"] =>
  value === "solid" || value === "dashed" || value === "dotted";

const isLineCap = (value: unknown): value is AppearanceSettings["edgeLinecap"] =>
  value === "round" || value === "butt" || value === "square";

const normalizeAppearance = (value: unknown): AppearanceSettings => {
  const defaults = DEFAULT_MIND_MAP_USER_SETTINGS.appearance;

  if (!value || typeof value !== "object") {
    return { ...defaults };
  }

  const appearance = value as Partial<AppearanceSettings>;

  return {
    edgeStyle: isEdgeLineStyle(appearance.edgeStyle)
      ? appearance.edgeStyle
      : defaults.edgeStyle,
    edgeLinecap: isLineCap(appearance.edgeLinecap)
      ? appearance.edgeLinecap
      : defaults.edgeLinecap,
    edgeWidth:
      typeof appearance.edgeWidth === "string"
        ? appearance.edgeWidth
        : defaults.edgeWidth,
    edgeColor:
      typeof appearance.edgeColor === "string"
        ? appearance.edgeColor
        : defaults.edgeColor,
    nodeBorderStyle: isBorderLineStyle(appearance.nodeBorderStyle)
      ? appearance.nodeBorderStyle
      : defaults.nodeBorderStyle,
    nodeBorderWidth:
      typeof appearance.nodeBorderWidth === "string"
        ? appearance.nodeBorderWidth
        : defaults.nodeBorderWidth,
    nodeBorderColor:
      typeof appearance.nodeBorderColor === "string"
        ? appearance.nodeBorderColor
        : defaults.nodeBorderColor,
  };
};

export const normalizeMindMapUserSettings = (
  value: unknown,
): MindMapUserSettings => {
  const defaults = DEFAULT_MIND_MAP_USER_SETTINGS;
  const raw = (value && typeof value === "object" ? value : {}) as Partial<
    MindMapUserSettings & { appearance?: unknown }
  >;

  return {
    theme: isTheme(raw.theme) ? raw.theme : defaults.theme,
    font: isFont(raw.font) ? raw.font : defaults.font,
    fontSize: isFontSize(raw.fontSize) ? raw.fontSize : defaults.fontSize,
    layoutDensity: isLayoutDensity(raw.layoutDensity)
      ? raw.layoutDensity
      : defaults.layoutDensity,
    siblingGap: clampLayoutGap(raw.siblingGap, LAYOUT_SIBLING_GAP),
    childGap: clampLayoutGap(raw.childGap, LAYOUT_CHILD_GAP),
    treeDirection: isTreeDirection(raw.treeDirection)
      ? raw.treeDirection
      : defaults.treeDirection,
    background: normalizeBackground(raw.background),
    backgroundColor:
      typeof raw.backgroundColor === "string"
        ? raw.backgroundColor
        : defaults.backgroundColor,
    appearance: normalizeAppearance(raw.appearance),
  };
};

export class MindMapSettingsManager {
  private _settings: MindMapUserSettings = {
    ...DEFAULT_MIND_MAP_USER_SETTINGS,
  };

  private _plugin: ISettingRegistry.ISettings | null = null;

  private _listeners = new Set<(settings: MindMapUserSettings) => void>();

  readonly changed = {
    connect: (fn: (settings: MindMapUserSettings) => void) => {
      this._listeners.add(fn);
      return {
        disconnect: () => {
          this._listeners.delete(fn);
        },
      };
    },
  };

  constructor(private _registry: ISettingRegistry) {}

  get settings(): MindMapUserSettings {
    return this._settings;
  }

  async ready(): Promise<void> {
    const plugin = await this._registry.load(MIND_MAP_SETTINGS_PLUGIN_ID);
    this._plugin = plugin;
    this._settings = normalizeMindMapUserSettings(plugin.composite);
    plugin.changed.connect(() => {
      this._settings = normalizeMindMapUserSettings(plugin.composite);
      this._emit();
    });
  }

  async update(partial: Partial<MindMapUserSettings>): Promise<void> {
    const next = normalizeMindMapUserSettings({
      ...this._settings,
      ...partial,
      appearance: partial.appearance
        ? { ...this._settings.appearance, ...partial.appearance }
        : this._settings.appearance,
    });

    this._settings = next;
    this._emit();

    if (!this._plugin) {
      return;
    }

    await Promise.all([
      this._plugin.set("theme", next.theme),
      this._plugin.set("font", next.font),
      this._plugin.set("fontSize", next.fontSize),
      this._plugin.set("layoutDensity", next.layoutDensity),
      this._plugin.set("siblingGap", next.siblingGap),
      this._plugin.set("childGap", next.childGap),
      this._plugin.set("treeDirection", next.treeDirection),
      this._plugin.set("background", next.background),
      this._plugin.set("backgroundColor", next.backgroundColor),
      this._plugin.set("appearance", next.appearance as unknown as JSONValue),
    ]);
  }

  private _emit(): void {
    this._listeners.forEach((listener) => {
      listener(this._settings);
    });
  }
}
