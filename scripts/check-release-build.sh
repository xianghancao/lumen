#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=lib/jupyter-tools.sh
source "$ROOT_DIR/scripts/lib/jupyter-tools.sh"

lumen_require_commands

cd "$ROOT_DIR"

echo "==> Production release build"
npm run build:release

required_files=(
  "packages/jupyterlab-lumen/jupyterlab_lumen/labextension/package.json"
  "packages/jupyterlab-lumen/jupyterlab_lumen/labextension/static/style.js"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "$ROOT_DIR/$file" ]]; then
    echo "ERROR: expected release artifact missing: $file" >&2
    exit 1
  fi
done

echo "==> Release build check passed"
