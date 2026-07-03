# Lumen

Jupyter-native **notebook mind map**: rearrange `.ipynb` cells on a spatial canvas by markdown heading hierarchy, using **Jupyter's own cell renderers** (CodeCell / MarkdownCell — not a custom rich-text editor).

## Version

| Component | Version |
|-----------|---------|
| **Lumen** | `0.2.0` |
| `lumen-kernel` | `0.2.0` |
| `jupyterlab-lumen` | `0.2.0` |

> Previous stack archived under [`old_lumen/`](./old_lumen/) (to be removed).

## Features

- **Native Jupyter cells** on a pannable, zoomable canvas with connector lines
- **Heading-driven tree**: `#` (H1) defines mind map roots; `##` / `###` / … nest underneath; other cells attach to the current heading
- **Drag-and-drop** reordering with drop zones (before / inside / after)
- **Two-way notebook sync**: same `.ipynb` model; structural edits update the notebook
- **Notebook → Lumen focus**: selecting a cell in the standard ipynb editor pans Lumen to the matching node
- **Tree direction**: top-bottom, bottom-top, left-right, right-left
- **Layout density**: Compact, Normal, Loose
- **Appearance**: connector line and node border style, width, and color
- **Markdown format toolbar** for the active cell (headings, lists, table, image, link, text color)
- **Keyboard shortcuts** (XMind-style) — see **Guide** in the header
- **Zoom** presets from 10% to 200% (includes 100%)

## Installation

### Requirements

| Component | Minimum |
|-----------|---------|
| **JupyterLab** | 4.x |
| **Python** | 3.9+ |
| **Node.js + npm** | Required to build from source (see below) |
| **Git** | Required to clone the monorepo |

> **Note:** Lumen is not published on PyPI yet. Install from this repository for now.

### Install from source (recommended)

Clone the repo, activate the Python environment where JupyterLab is installed, then run:

```bash
git clone https://github.com/xianghancao/lumen.git
cd lumen
npm run jlab:install
jupyter lab
```

`npm run jlab:install` builds the extension, runs `pip install -e packages/jupyterlab-lumen`, and rebuilds JupyterLab.

Use a specific Python/Jupyter if they are not first on your `PATH`:

```bash
LUMEN_PYTHON=/path/to/python LUMEN_JUPYTER=/path/to/jupyter npm run jlab:install
```

### Manual install

```bash
git clone https://github.com/xianghancao/lumen.git
cd lumen

npm install
npm run build:extension

python -m pip install -e packages/jupyterlab-lumen
jupyter lab build

jupyter lab
```

Run these commands from the **repository root** so the `lumen-kernel` workspace package is available.

### Verify

```bash
npm run jlab:verify
# or
jupyter labextension list | grep -i lumen
```

You should see `jupyterlab-lumen` enabled.

### Uninstall

```bash
python -m pip uninstall jupyterlab-lumen
jupyter lab build
```

### Open Lumen

Open any `.ipynb` (try `examples/example.ipynb`), then either:

- Click the **tree-view** button in the notebook toolbar, or
- **Right-click the file → Open With → Lumen Mind Map**

You can keep the classic notebook view and Lumen open on the same file side by side.

## Quick start

If you already installed Lumen:

```bash
jupyter lab
```

Then open `examples/example.ipynb` with **Lumen Mind Map** as described above.

## Using Lumen

### Header (row 1)

Jupyter document toolbar: save, insert, cut/copy/paste, run, kernel, cell type, etc.

### Header (row 2)

| Area | Controls |
|------|----------|
| **Left** | **Add Mind Map** (+), **Lumen**, **Tree**, **Line**, **Border**, **Layout** |
| **Right** | Markdown **format** buttons, **Guide** (shortcuts) |

- **Tree** — layout direction (↓ ↑ → ←)
- **Line** — connector style, width, color
- **Border** — node border style, width, color
- **Layout** — Compact / Normal / Loose node spacing

### Canvas

| Action | Behavior |
|--------|----------|
| **Single click** | Select node (persistent highlight) |
| **Double click** | Edit cell |
| **Drag handle** (left edge) | Reorder in the outline tree |
| **Wheel** | Pan |
| **Ctrl/Cmd + wheel** | Zoom |
| **Bottom-right** | Node count and **Zoom: N%** menu |

### Outline rules

1. The first `#` heading in the notebook becomes a **root** node.
2. Deeper headings nest under the nearest higher-level heading.
3. Non-heading cells belong to the current heading context.
4. Content before the first `#` (or orphan `##+` without an H1 parent) is ignored in the map.

## Architecture

```
.ipynb (shared INotebookModel)
    → lumen-kernel: heading outline tree + dagre layout
    → jupyterlab-lumen: canvas with native Jupyter cell widgets
```

No Tiptap, React Flow, or separate `.lumen.json` sidecar in this line.

## Development

Requires the [installation requirements](#requirements) above. From the repository root:

```bash
# One-shot build + install into the active Python environment
npm run jlab:install

# Watch mode (separate terminal)
npm run jlab:dev
jupyter lab
```

Build individual packages:

```bash
npm run build:kernel
npm run build:extension:lib
npm run build:extension
```

Verify the extension:

```bash
npm run jlab:verify
```

## Repository layout

```
packages/
  lumen-kernel/         # outline tree, layout, navigation
  jupyterlab-lumen/     # JupyterLab extension + UI
old_lumen/              # archived previous stack
examples/
  example.ipynb
scripts/
```

## License

BSD-3-Clause (extension)
