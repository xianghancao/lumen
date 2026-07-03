#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=lib/jupyter-tools.sh
source "$ROOT_DIR/scripts/lib/jupyter-tools.sh"

lumen_require_commands

echo "==> Lumen JupyterLab extension installer"
echo "    repo:   $ROOT_DIR"
echo "    python: $LUMEN_PYTHON"
echo "    jupyter: $LUMEN_JUPYTER"

cd "$ROOT_DIR"

lumen_remove_stale_labextension_symlink "$LUMEN_PYTHON"

npm install
npm run build:extension

if "$LUMEN_PYTHON" -m pip show jupyterlab-lumen >/dev/null 2>&1; then
  echo "==> Uninstalling previous jupyterlab-lumen"
  "$LUMEN_PYTHON" -m pip uninstall -y jupyterlab-lumen
fi

"$LUMEN_PYTHON" -m pip install -e packages/jupyterlab-lumen
"$LUMEN_JUPYTER" lab build

echo "Done. Start JupyterLab: $LUMEN_JUPYTER lab"
echo "Open examples/example.ipynb → Open With → Lumen Mind Map"
