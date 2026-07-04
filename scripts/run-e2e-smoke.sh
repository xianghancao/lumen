#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=lib/jupyter-tools.sh
source "$ROOT_DIR/scripts/lib/jupyter-tools.sh"

lumen_require_commands

PORT="${LUMEN_E2E_PORT:-18888}"
TOKEN="${LUMEN_E2E_TOKEN:-lumen-e2e-token}"
LOG_FILE="${LUMEN_E2E_LOG:-/tmp/lumen-e2e-jupyter.log}"
PID_FILE="${LUMEN_E2E_PID:-/tmp/lumen-e2e-jupyter.pid}"

cd "$ROOT_DIR"

if ! "$LUMEN_JUPYTER" labextension list 2>&1 | grep -qi lumen; then
  echo "ERROR: jupyterlab-lumen is not installed. Run: npm run jlab:install" >&2
  exit 1
fi

echo "==> Building extension artifacts"
npm run build:extension

if ! node -e "import('playwright')" >/dev/null 2>&1; then
  echo "ERROR: playwright is not installed. Run: npm install" >&2
  exit 1
fi

if [[ ! -d "$HOME/.cache/ms-playwright" ]] && [[ ! -d "$ROOT_DIR/node_modules/playwright-core/.local-browsers" ]]; then
  echo "==> Installing Playwright Chromium (first run)"
  npx playwright install chromium
fi

cleanup() {
  if [[ -f "$PID_FILE" ]]; then
    kill "$(cat "$PID_FILE")" 2>/dev/null || true
    rm -f "$PID_FILE"
  fi
}
trap cleanup EXIT INT TERM

if lsof -i ":$PORT" >/dev/null 2>&1; then
  echo "ERROR: port $PORT is already in use. Set LUMEN_E2E_PORT to another value." >&2
  exit 1
fi

echo "==> Starting JupyterLab on port $PORT"
"$LUMEN_JUPYTER" lab \
  --no-browser \
  --port="$PORT" \
  --IdentityProvider.token="$TOKEN" \
  --ServerApp.root_dir="$ROOT_DIR" \
  --ServerApp.address=127.0.0.1 \
  >"$LOG_FILE" 2>&1 &
echo $! >"$PID_FILE"

ready=0
for _ in $(seq 1 90); do
  if curl -sf "http://127.0.0.1:$PORT/lab?token=$TOKEN" >/dev/null; then
    ready=1
    break
  fi
  if ! kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    echo "ERROR: JupyterLab exited before becoming ready. Log:" >&2
    tail -n 40 "$LOG_FILE" >&2 || true
    exit 1
  fi
  sleep 1
done

if [[ "$ready" -ne 1 ]]; then
  echo "ERROR: timed out waiting for JupyterLab on port $PORT" >&2
  tail -n 40 "$LOG_FILE" >&2 || true
  exit 1
fi

export LUMEN_E2E_URL="http://127.0.0.1:$PORT"
export LUMEN_E2E_TOKEN="$TOKEN"

echo "==> Running JupyterLab smoke E2E"
node "$ROOT_DIR/e2e/jupyterlab-smoke.mjs"
