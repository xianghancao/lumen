#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

read_version() {
  local file="$1"
  local pattern="$2"
  grep -E "$pattern" "$file" | head -n 1 | sed -E 's/.*"([^"]+)".*/\1/'
}

ROOT_VERSION="$(read_version "$ROOT_DIR/package.json" '"version":')"
KERNEL_VERSION="$(read_version "$ROOT_DIR/packages/lumen-kernel/package.json" '"version":')"
EXTENSION_VERSION="$(read_version "$ROOT_DIR/packages/jupyterlab-lumen/package.json" '"version":')"
TS_VERSION="$(grep -E 'export const LUMEN_VERSION = ' "$ROOT_DIR/packages/jupyterlab-lumen/src/version.ts" | sed -E 's/.*"([^"]+)".*/\1/')"
PY_VERSION="$(grep -E '^__version__ = ' "$ROOT_DIR/packages/jupyterlab-lumen/jupyterlab_lumen/_version.py" | sed -E 's/.*"([^"]+)".*/\1/')"
KERNEL_DEP="$(read_version "$ROOT_DIR/packages/jupyterlab-lumen/package.json" '"lumen-kernel":')"

EXPECTED="$ROOT_VERSION"
MISMATCH=0

check_equal() {
  local label="$1"
  local actual="$2"

  if [[ "$actual" != "$EXPECTED" ]]; then
    echo "ERROR: $label version mismatch: expected $EXPECTED, got $actual" >&2
    MISMATCH=1
  fi
}

check_equal "root package.json" "$ROOT_VERSION"
check_equal "lumen-kernel package.json" "$KERNEL_VERSION"
check_equal "jupyterlab-lumen package.json" "$EXTENSION_VERSION"
check_equal "version.ts" "$TS_VERSION"
check_equal "_version.py" "$PY_VERSION"
check_equal "jupyterlab-lumen → lumen-kernel dependency" "$KERNEL_DEP"

if [[ "$MISMATCH" -ne 0 ]]; then
  exit 1
fi

echo "==> Version check passed ($EXPECTED)"
