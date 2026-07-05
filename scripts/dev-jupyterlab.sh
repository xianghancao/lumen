#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=lib/jupyter-tools.sh
source "$ROOT_DIR/scripts/lib/jupyter-tools.sh"

kuusi_require_commands

cd "$ROOT_DIR"

if [[ ! -d packages/kuusi-kernel/dist ]]; then
  npm install
  npm run build:extension
fi

npm run watch --workspace=kuusi-kernel &
PIDS=($!)
npm run watch --workspace=jupyterlab-kuusi &
PIDS+=($!)
(
  cd packages/jupyterlab-kuusi
  "$KUUSI_JUPYTER" labextension watch .
) &
PIDS+=($!)

trap 'kill "${PIDS[@]}" 2>/dev/null || true' EXIT INT TERM

echo "Watchers running. Refresh browser after rebuild."
wait
