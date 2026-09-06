#!/usr/bin/env bash
# Launcher: exports the announcer for every child process, then replaces itself with cellars.sh.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_DIR

encounter::announce() {
  echo "encounter: $*"
}
export -f encounter::announce

exec bash "$SCRIPT_DIR/cellars.sh" "$@"
