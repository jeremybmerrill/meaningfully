#!/usr/bin/env bash
set -euo pipefail

# Toggle @meaningfully/core and @meaningfully/ui between local file paths and npm versions.
# Usage:
#   ./scripts/toggle-deps.sh local   # switch to local file references
#   ./scripts/toggle-deps.sh prod    # switch to latest npm versions

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

MODE="${1:-}"
if [[ "$MODE" != "local" && "$MODE" != "prod" ]]; then
  echo "Usage: $0 <local|prod>"
  echo "  local  - use file:../meaningfully-core and file:../meaningfully-ui"
  echo "  prod   - fetch latest versions from npm"
  exit 1
fi

# Files that reference these packages
ROOT_PKG="$ROOT_DIR/package.json"
# BACKEND_PKG="$ROOT_DIR/packages/meaningfully-hosted-backend/package.json"
# FRONTEND_PKG="$ROOT_DIR/packages/meaningfully-hosted-frontend/package.json"

LOCAL_CORE="file:../meaningfully-core"
LOCAL_UI="file:../meaningfully-ui"

update_dep() {
  local file="$1"
  local pkg="$2"
  local new_value="$3"

  # Use node for reliable JSON editing (preserves formatting better than jq)
  node -e "
    const fs = require('fs');
    const raw = fs.readFileSync('$file', 'utf8');
    const pkg = JSON.parse(raw);
    let changed = false;
    for (const section of ['dependencies', 'devDependencies']) {
      if (pkg[section] && pkg[section]['$pkg'] !== undefined) {
        pkg[section]['$pkg'] = '$new_value';
        changed = true;
      }
    }
    if (changed) {
      // Detect indent from original file
      const indent = raw.match(/^(\s+)\"/m)?.[1] || '  ';
      fs.writeFileSync('$file', JSON.stringify(pkg, null, indent) + '\n');
      console.log('  Updated $pkg in $file → $new_value');
    }
  "
}

if [[ "$MODE" == "local" ]]; then
  echo "Switching to local dependencies..."
  update_dep "$ROOT_PKG"     "@meaningfully/core" "$LOCAL_CORE"
  # update_dep "$BACKEND_PKG"  "@meaningfully/core" "$LOCAL_CORE"
  update_dep "$ROOT_PKG" "@meaningfully/ui"   "$LOCAL_UI"
  echo "Done. Run 'npm install' to link local packages."

elif [[ "$MODE" == "prod" ]]; then
  echo "Fetching latest versions from npm..."

  CORE_VERSION=$(npm view @meaningfully/core version 2>/dev/null)
  UI_VERSION=$(npm view @meaningfully/ui version 2>/dev/null)

  if [[ -z "$CORE_VERSION" ]]; then
    echo "ERROR: Could not fetch version for @meaningfully/core from npm" >&2
    exit 1
  fi
  if [[ -z "$UI_VERSION" ]]; then
    echo "ERROR: Could not fetch version for @meaningfully/ui from npm" >&2
    exit 1
  fi

  echo "  @meaningfully/core latest: $CORE_VERSION"
  echo "  @meaningfully/ui   latest: $UI_VERSION"
  echo ""

  update_dep "$ROOT_PKG"     "@meaningfully/core" "^$CORE_VERSION"
  # update_dep "$BACKEND_PKG"  "@meaningfully/core" "^$CORE_VERSION"
  update_dep "$ROOT_PKG" "@meaningfully/ui"   "^$UI_VERSION"
  echo "Done. Run 'npm install' to fetch packages from npm."
fi
