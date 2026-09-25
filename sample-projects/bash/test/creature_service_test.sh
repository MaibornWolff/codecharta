#!/usr/bin/env bash
# Tests for creature_service, runnable with plain bash.
set -euo pipefail

CELLARS_LIB="$(cd "$(dirname "${BASH_SOURCE[0]}")/../lib" && pwd)"
readonly CELLARS_LIB

# shellcheck source=../lib/domain/service/creature_service.sh
source "$CELLARS_LIB/domain/service/creature_service.sh"
# shellcheck source=../lib/adapter/persistence/persisted_creatures.sh
source "$CELLARS_LIB/adapter/persistence/persisted_creatures.sh"

declare -A mock_stable=()

mock_creatures::save() {
  mock_stable["$1"]="saved"
}

mock_creatures::find() {
  creatures::find "$@"
}

should_save_creature_to_the_stable() {
  # Arrange
  creatures::register mock_creatures
  local walkingSpeed=30
  local XPValue=450
  local centaur
  centaur="$(creature_id::new centaur-1)"
  creature::new "$centaur" beast
  creature::set_speed "$centaur" walking "$(speed::new "$walkingSpeed")"
  CREATURES["${centaur}.xp_value"]="$XPValue"

  # Act
  creature_service::save "$centaur"

  # Assert
  [[ "${mock_stable[$centaur]}" == "saved" ]] || { echo "FAIL: creature was not saved" >&2; return 1; }
  echo "PASS: should_save_creature_to_the_stable"
}

should_raise_when_creature_is_unknown() {
  # Arrange
  creatures::register persisted_creatures

  # Act
  local exit_code=0
  creature_service::find "unknown-creature" 2> /dev/null || exit_code=$?

  # Assert
  [[ "$exit_code" == "$NO_SUCH_CREATURE_EXIT_CODE" ]] || { echo "FAIL: expected no such creature" >&2; return 1; }
  echo "PASS: should_raise_when_creature_is_unknown"
}

should_save_creature_to_the_stable
should_raise_when_creature_is_unknown
