#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=lib/jupyter-tools.sh
source "$ROOT_DIR/scripts/lib/jupyter-tools.sh"

lumen_require_commands

"$LUMEN_JUPYTER" labextension list 2>&1 | grep -i lumen || {
  echo "jupyterlab-lumen not found" >&2
  exit 1
}
