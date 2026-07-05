#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=lib/jupyter-tools.sh
source "$ROOT_DIR/scripts/lib/jupyter-tools.sh"

kuusi_require_commands

"$KUUSI_JUPYTER" labextension list 2>&1 | grep -i kuusi || {
  echo "jupyterlab-kuusi not found" >&2
  exit 1
}
