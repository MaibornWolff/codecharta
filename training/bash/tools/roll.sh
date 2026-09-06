#!/usr/bin/env bash
# Rolls initiative. Run by path from bin/cellars.sh, never sourced.
set -euo pipefail

. "$(dirname "${BASH_SOURCE[0]}")/../lib/domain/model/dice.sh"

# encounter::announce only exists here when bin/encounter.sh exported it with `export -f`.
roll::announce() {
  if declare -F encounter::announce > /dev/null; then
    encounter::announce "$@"
  else
    echo "$*"
  fi
}

roll::announce "initiative roll: $(roll_d20)"
