import { closeLumenDropdownMenus } from "./formatToolbar";
import type { LumenTranslator } from "./lumenI18n";
import { applyLumenLogo } from "./lumenLogo";
import { LUMEN_GITHUB_URL, LUMEN_VERSION } from "./version";

const LUMEN_GITHUB_REPO = "xianghancao/lumen";
const VERSION_CACHE_KEY = "jupyterlab-lumen:latest-version";
const VERSION_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type VersionCacheEntry = {
  version: string;
  fetchedAt: number;
};

const normalizeVersion = (version: string): string =>
  version.trim().replace(/^v/i, "");

const compareVersions = (left: string, right: string): number => {
  const parse = (value: string) =>
    normalizeVersion(value)
      .split(".")
      .map((part) => Number.parseInt(part, 10))
      .map((part) => (Number.isFinite(part) ? part : 0));

  const a = parse(left);
  const b = parse(right);
  const length = Math.max(a.length, b.length);

  for (let index = 0; index < length; index += 1) {
    const diff = (a[index] ?? 0) - (b[index] ?? 0);

    if (diff !== 0) {
      return diff;
    }
  }

  return 0;
};

const readVersionCache = (): VersionCacheEntry | null => {
  try {
    const raw = localStorage.getItem(VERSION_CACHE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as VersionCacheEntry;

    if (
      typeof parsed.version !== "string" ||
      typeof parsed.fetchedAt !== "number"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const writeVersionCache = (version: string): void => {
  try {
    const entry: VersionCacheEntry = {
      version,
      fetchedAt: Date.now(),
    };
    localStorage.setItem(VERSION_CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Ignore storage failures in private browsing or restricted environments.
  }
};

const isCacheFresh = (entry: VersionCacheEntry): boolean =>
  Date.now() - entry.fetchedAt < VERSION_CACHE_TTL_MS;

export const fetchLatestLumenVersion = async (): Promise<string | null> => {
  const releaseResponse = await fetch(
    `https://api.github.com/repos/${LUMEN_GITHUB_REPO}/releases/latest`,
  );

  if (releaseResponse.ok) {
    const release = (await releaseResponse.json()) as { tag_name?: string };

    if (release.tag_name) {
      return normalizeVersion(release.tag_name);
    }
  }

  const packageResponse = await fetch(
    `https://raw.githubusercontent.com/${LUMEN_GITHUB_REPO}/main/packages/jupyterlab-lumen/package.json`,
  );

  if (!packageResponse.ok) {
    return null;
  }

  const packageJson = (await packageResponse.json()) as { version?: string };
  return packageJson.version ? normalizeVersion(packageJson.version) : null;
};

const applyLatestVersionState = (
  latestValueEl: HTMLElement,
  latest: string,
  t: LumenTranslator,
  cached = false,
): void => {
  latestValueEl.textContent = `v${latest}`;
  latestValueEl.classList.remove("is-update-available", "is-up-to-date");

  if (compareVersions(latest, LUMEN_VERSION) > 0) {
    latestValueEl.classList.add("is-update-available");
    latestValueEl.title = t.newVersionAvailable();
    return;
  }

  latestValueEl.classList.add("is-up-to-date");
  latestValueEl.title = cached
    ? `${t.upToDate()} (${t.latestVersion()} cached)`
    : t.upToDate();
};

const refreshLatestVersion = (
  latestValueEl: HTMLElement,
  t: LumenTranslator,
): void => {
  const cached = readVersionCache();

  if (cached) {
    applyLatestVersionState(latestValueEl, cached.version, t, true);
  } else {
    latestValueEl.textContent = "—";
    latestValueEl.classList.remove("is-update-available", "is-up-to-date");
    latestValueEl.title = t.latestUnavailable();
  }

  if (cached && isCacheFresh(cached)) {
    return;
  }

  void fetchLatestLumenVersion()
    .then((latest) => {
      if (!latest) {
        if (!cached) {
          latestValueEl.textContent = t.latestUnavailable();
          latestValueEl.title = t.latestUnavailable();
        }
        return;
      }

      writeVersionCache(latest);
      applyLatestVersionState(latestValueEl, latest, t, false);
    })
    .catch(() => {
      if (!cached) {
        latestValueEl.textContent = t.latestUnavailable();
        latestValueEl.title = t.latestUnavailable();
      }
    });
};

const createVersionRow = (
  label: string,
  value: string,
): { row: HTMLElement; valueEl: HTMLElement } => {
  const row = document.createElement("div");
  row.className = "jp-LumenProductDropdown-versionRow";
  row.setAttribute("role", "menuitem");

  const labelEl = document.createElement("span");
  labelEl.className = "jp-LumenProductDropdown-versionLabel";
  labelEl.textContent = label;

  const valueEl = document.createElement("span");
  valueEl.className = "jp-LumenProductDropdown-versionValue";
  valueEl.textContent = value;

  row.append(labelEl, valueEl);
  return { row, valueEl };
};

export const createProductMenu = (
  root: HTMLElement,
  t: LumenTranslator,
): HTMLElement => {
  const wrapper = document.createElement("div");
  wrapper.className =
    "jp-LumenFormatDropdown jp-LumenProductDropdown jp-LumenNotebookMindMap-header-brand";

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "jp-LumenNotebookMindMap-header-title";
  trigger.setAttribute("aria-haspopup", "menu");
  trigger.setAttribute("aria-label", "Lumen");
  trigger.title = "Lumen";
  applyLumenLogo(trigger, "header");

  const menu = document.createElement("div");
  menu.className =
    "jp-LumenFormatDropdown-menu jp-LumenFormatDropdown-menu-wide jp-LumenProductDropdown-menu";
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-label", "Lumen");

  const versionTitle = document.createElement("div");
  versionTitle.className = "jp-LumenFormatDropdown-section";
  versionTitle.textContent = t.version();
  menu.appendChild(versionTitle);

  const versionPanel = document.createElement("div");
  versionPanel.className = "jp-LumenProductDropdown-versionPanel";

  const currentRow = createVersionRow(t.currentVersion(), `v${LUMEN_VERSION}`);
  const latestRow = createVersionRow(t.latestVersion(), "—");
  versionPanel.append(currentRow.row, latestRow.row);
  menu.appendChild(versionPanel);

  const repoTitle = document.createElement("div");
  repoTitle.className = "jp-LumenFormatDropdown-section";
  repoTitle.textContent = t.repository();
  menu.appendChild(repoTitle);

  const repoLink = document.createElement("a");
  repoLink.className =
    "jp-LumenFormatDropdown-item jp-LumenProductDropdown-link";
  repoLink.setAttribute("role", "menuitem");
  repoLink.href = LUMEN_GITHUB_URL;
  repoLink.target = "_blank";
  repoLink.rel = "noopener noreferrer";
  repoLink.textContent = LUMEN_GITHUB_URL;
  repoLink.title = t.openRepository();

  repoLink.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  menu.appendChild(repoLink);

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = menu.classList.contains("is-open");
    closeLumenDropdownMenus(root);

    if (!isOpen) {
      menu.classList.add("is-open");
      refreshLatestVersion(latestRow.valueEl, t);
    }
  });

  document.addEventListener("click", () => {
    closeLumenDropdownMenus(root);
  });

  wrapper.append(trigger, menu);
  return wrapper;
};
