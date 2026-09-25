#!/usr/bin/env bash
# Fightable: the contract every combatant has to fulfil.
# Bash has no interfaces; an implementation registers itself and this file
# checks that the required functions are defined.

FIGHTABLE_REQUIRED_FUNCTIONS=(attack take_damage)

fightable::assert_implemented() {
  local namespace="$1"
  local required
  for required in "${FIGHTABLE_REQUIRED_FUNCTIONS[@]}"; do
    if ! declare -F "${namespace}::${required}" > /dev/null; then
      echo "${namespace} does not implement fightable::${required}" >&2
      return 1
    fi
  done
}
