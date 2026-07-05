#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

echo "==> Building kuusi-kernel"
npm run build:kernel

echo "==> Building jupyterlab-kuusi TypeScript"
npm run build:extension:lib

required_files=(
  "packages/kuusi-kernel/dist/index.js"
  "packages/kuusi-kernel/dist/notebook-outline.js"
  "packages/jupyterlab-kuusi/lib/index.js"
  "packages/jupyterlab-kuusi/lib/notebookMindMapWidget.js"
  "packages/jupyterlab-kuusi/schema/plugin.json"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "$ROOT_DIR/$file" ]]; then
    echo "ERROR: expected build artifact missing: $file" >&2
    exit 1
  fi
done

echo "==> Extension build check passed"
