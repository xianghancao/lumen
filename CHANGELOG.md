# Changelog

All notable changes to Kuusi are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Version sync check (`npm run check:versions`) and production release build check (`npm run test:release-build`)

### Changed

- Rebranded from **Lumen** to **Kuusi** (Finnish for spruce): packages `kuusi-kernel` / `jupyterlab-kuusi`, UI classes `jp-Kuusi*`, document factory **Kuusi Mind Map**
- Standardized on **npm** only (`package-lock.json`); removed Yarn lockfile and config
- Local install keeps dev labextension build; release/PyPI path uses production `build:labextension`
- Consolidated Playwright smoke test under `e2e/jupyterlab-smoke.mjs`

### Removed

- Ad-hoc debug Playwright scripts under `scripts/debug-*.mjs` and `scripts/test-*.mjs`
- Stale `old_lumen/` references from README (directory already absent from the repo)

## [0.2.0] - 2026-07-03

First public release of the Jupyter-native mind map stack (`kuusi-kernel` + `jupyterlab-kuusi`). Replaces the archived React/Tiptap prototype under `old_lumen/`.

### Added

- **Kuusi Mind Map** document factory for `.ipynb` files in JupyterLab 4
- **Heading-driven outline tree** in `kuusi-kernel` (`#` = root, nested `##`–`######`, content cells attach to current heading)
- **Spatial canvas** with native Jupyter CodeCell / MarkdownCell widgets (not a custom editor)
- **Pan and zoom** (10%–200% presets, Ctrl/Cmd + wheel), fullscreen toggle
- **Drag-and-drop** node reordering with before / inside / after drop zones
- **Two-way notebook sync** — structural edits update the shared `INotebookModel`
- **Notebook ↔ Kuusi focus sync** — selecting a cell in the classic editor pans to the matching node
- **Tree direction** toolbar: TB, BT, LR, RL
- **Style** themes: Classic, Soft, Contrast
- **Line / Border** appearance controls (style, width, color)
- **Font** toolbar (notebook default + sans-serif and serif families)
- **Layout** density: Compact, Normal, Loose (XMind-style spacing)
- **Background** presets: Default, Plain (dark), Grid, Dots, Gradient, Business Blue, Eye Care, Newspaper
- **Markdown format toolbar** (edit mode): Title H1–H6, Aa styles, lists, table grid, image/link (Markdown + HTML), font color
- **Guide** dropdown with mind-map and formatting keyboard shortcuts
- **Product menu** (Kuusi logo): current version, latest version check, GitHub repository link
- **Empty node insertion** via Tab (child) / Enter (sibling) with correct outline hierarchy via `metadata.kuusi.headingLevel`
- **Persistent user settings** (theme, font, layout, tree direction, background, appearance) via JupyterLab `ISettingRegistry`
- **Offline-friendly version check** with `localStorage` cache and graceful fallback
- **i18n groundwork** — UI strings routed through JupyterLab `TranslationBundle`
- Example notebook at `examples/example.ipynb`
- **Automated tests**: kernel unit tests (`npm run test:kernel`), extension build check (`npm run test:build`), JupyterLab smoke E2E (`npm run test:e2e`), GitHub Actions CI

### Changed

- Logo uses gold gradient with the Jupyter UI font (no cursive/webfont)
- Empty nodes show a blank title instead of `markdown cell N`

### Removed

- Dependency on the archived `old_lumen/` stack (Tiptap, React Flow, `.lumen.json` sidecar)

## [0.1.x and earlier]

Pre-0.2.0 prototypes lived in `old_lumen/` and are not part of this changelog.

[Unreleased]: https://github.com/xianghancao/lumen/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/xianghancao/lumen/releases/tag/v0.2.1
[0.2.0]: https://github.com/xianghancao/lumen/releases/tag/v0.2.0
