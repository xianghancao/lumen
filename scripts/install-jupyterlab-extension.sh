#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=lib/jupyter-tools.sh
source "$ROOT_DIR/scripts/lib/jupyter-tools.sh"

kuusi_require_commands

echo "==> Kuusi JupyterLab extension installer"
echo "    repo:   $ROOT_DIR"
echo "    python: $KUUSI_PYTHON"
echo "    jupyter: $KUUSI_JUPYTER"

cd "$ROOT_DIR"

kuusi_remove_stale_labextension_symlink "$KUUSI_PYTHON"

npm install
npm run build:extension

if "$KUUSI_PYTHON" -m pip show jupyterlab-kuusi >/dev/null 2>&1; then
  echo "==> Uninstalling previous jupyterlab-kuusi"
  "$KUUSI_PYTHON" -m pip uninstall -y jupyterlab-kuusi
fi

"$KUUSI_PYTHON" -m pip install -e packages/jupyterlab-kuusi
"$KUUSI_JUPYTER" lab build

echo "Done. Start JupyterLab: $KUUSI_JUPYTER lab"
echo "Open examples/example.ipynb → Open With → Kuusi Mind Map"
