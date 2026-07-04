#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

echo "==> Building lumen-kernel"
npm run build:kernel

echo "==> Building jupyterlab-lumen TypeScript"
npm run build:extension:lib

required_files=(
  "packages/lumen-kernel/dist/index.js"
  "packages/lumen-kernel/dist/notebook-outline.js"
  "packages/jupyterlab-lumen/lib/index.js"
  "packages/jupyterlab-lumen/lib/notebookMindMapWidget.js"
  "packages/jupyterlab-lumen/schema/plugin.json"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "$ROOT_DIR/$file" ]]; then
    echo "ERROR: expected build artifact missing: $file" >&2
    exit 1
  fi
done

echo "==> Extension build check passed"
