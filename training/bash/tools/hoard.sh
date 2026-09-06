#!/usr/bin/env bash
# Prints the treasure hoard a creature with the given XP value guards.
set -euo pipefail

LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../lib" && pwd)"
readonly LIB_DIR

# shellcheck source=../lib/application/creature_util.sh
source "$LIB_DIR/application/creature_util.sh"

# The model arrives transitively through creature_util.sh; this check is the only reference to creature.sh.
command -v creature::id > /dev/null || { echo "creature model not loaded" >&2; exit 1; }

creature_util::hoard_of_xp "${1:-0}"
echo
