#!/usr/bin/env bash
# CreatureType: an enumeration modelled as a readonly array.

CREATURE_TYPES=(monstrosity beast aberration celestial dragon fiend humanoid undead)

creature_type::is_valid() {
  local candidate="$1"
  local creature_type
  for creature_type in "${CREATURE_TYPES[@]}"; do
    [[ "$creature_type" == "$candidate" ]] && return 0
  done
  return 1
}
