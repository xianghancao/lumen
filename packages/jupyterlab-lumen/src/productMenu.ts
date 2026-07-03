import { closeLumenDropdownMenus } from "./formatToolbar";
import { applyLumenLogo } from "./lumenLogo";
import { LUMEN_GITHUB_URL, LUMEN_VERSION } from "./version";

const LUMEN_GITHUB_REPO = "xianghancao/lumen";

const LUMEN_FEATURES = [
  "Spatial mind map view for Jupyter notebooks",
  "Heading-based outline tree with native cell renderers",
  "Drag-and-drop reordering synced to the notebook",
  "Notebook editor selection focuses the matching node",
  "Tree direction, layout density, background, theme, and appearance controls",
  "Markdown formatting toolbar and keyboard shortcuts",
];

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

export const createProductMenu = (root: HTMLElement): HTMLElement => {
  const wrapper = document.createElement("div");
  wrapper.className =
    "jp-LumenFormatDropdown jp-LumenProductDropdown jp-LumenNotebookMindMap-header-brand";

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "jp-LumenNotebookMindMap-header-title";
  trigger.setAttribute("aria-haspopup", "menu");
  trigger.setAttribute("aria-label", "About Lumen");
  trigger.title = "About Lumen";
  applyLumenLogo(trigger, "header");

  const menu = document.createElement("div");
  menu.className =
    "jp-LumenFormatDropdown-menu jp-LumenFormatDropdown-menu-wide jp-LumenProductDropdown-menu";
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-label", "About Lumen");

  const featuresTitle = document.createElement("div");
  featuresTitle.className = "jp-LumenFormatDropdown-section";
  featuresTitle.textContent = "Features";
  menu.appendChild(featuresTitle);

  const featuresList = document.createElement("ul");
  featuresList.className = "jp-LumenProductDropdown-features";

  LUMEN_FEATURES.forEach((feature) => {
    const item = document.createElement("li");
    item.className = "jp-LumenProductDropdown-feature";
    item.textContent = feature;
    featuresList.appendChild(item);
  });

  menu.appendChild(featuresList);

  const versionTitle = document.createElement("div");
  versionTitle.className = "jp-LumenFormatDropdown-section";
  versionTitle.textContent = "Version";
  menu.appendChild(versionTitle);

  const versionButton = document.createElement("button");
  versionButton.type = "button";
  versionButton.className =
    "jp-LumenFormatDropdown-item jp-LumenProductDropdown-version";
  versionButton.setAttribute("role", "menuitem");
  versionButton.title = "Check for updates";
  versionButton.textContent = `v${LUMEN_VERSION}`;

  versionButton.addEventListener("click", (event) => {
    event.stopPropagation();
    void (async () => {
      versionButton.disabled = true;
      versionButton.textContent = "Checking for updates…";

      try {
        const latest = await fetchLatestLumenVersion();

        if (!latest) {
          versionButton.textContent = `v${LUMEN_VERSION} — unable to check`;
          return;
        }

        if (compareVersions(latest, LUMEN_VERSION) > 0) {
          versionButton.textContent = `v${LUMEN_VERSION} — update available: v${latest}`;
          versionButton.title = `Latest release: v${latest}`;
          return;
        }

        versionButton.textContent = `v${LUMEN_VERSION} — up to date`;
        versionButton.title = "You are on the latest version";
      } catch {
        versionButton.textContent = `v${LUMEN_VERSION} — check failed`;
      } finally {
        versionButton.disabled = false;
      }
    })();
  });

  menu.appendChild(versionButton);

  const repoTitle = document.createElement("div");
  repoTitle.className = "jp-LumenFormatDropdown-section";
  repoTitle.textContent = "Repository";
  menu.appendChild(repoTitle);

  const repoLink = document.createElement("a");
  repoLink.className =
    "jp-LumenFormatDropdown-item jp-LumenProductDropdown-link";
  repoLink.setAttribute("role", "menuitem");
  repoLink.href = LUMEN_GITHUB_URL;
  repoLink.target = "_blank";
  repoLink.rel = "noopener noreferrer";
  repoLink.textContent = LUMEN_GITHUB_URL;
  repoLink.title = "Open GitHub repository";

  repoLink.addEventListener("click", (event) => {
    event.stopPropagation();
    closeLumenDropdownMenus(root);
  });

  menu.appendChild(repoLink);

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

  wrapper.append(trigger, menu);
  return wrapper;
};
