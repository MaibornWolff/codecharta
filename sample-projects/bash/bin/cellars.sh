#!/usr/bin/env bash
# Entry point: creates one creature and prints it.
set -euo pipefail

CELLARS_LIB="$(cd "$(dirname "${BASH_SOURCE[0]}")/../lib" && pwd)"
readonly CELLARS_LIB
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_DIR

# shellcheck source=../lib/application/index.sh
source "$CELLARS_LIB/application/index.sh"
# shellcheck source=../lib/adapter/persistence/persisted_creatures.sh
source "$CELLARS_LIB/adapter/persistence/persisted_creatures.sh"
# shellcheck source=../lib/domain/model/dice.sh
source "$CELLARS_LIB/domain/model/dice.sh"

main() {
  local creature=""
  creature_facade::create creature dragon 40 80 40 0 40 "$(armor_class::new 17 2)" 200
  echo "initiative: $(roll_d20)"
  "$SCRIPT_DIR/../tools/roll.sh"
  creature_util::describe "$creature"
  creature_facade::to_dto "$creature"
  echo
}

main "$@"
