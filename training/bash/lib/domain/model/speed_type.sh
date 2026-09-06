#!/usr/bin/env bash
# SpeedType: an enumeration modelled as a readonly array.

SPEED_TYPES=(walking flying swimming burrowing climbing)

speed_type::is_valid() {
  local candidate="$1"
  local speed_type
  for speed_type in "${SPEED_TYPES[@]}"; do
    [[ "$speed_type" == "$candidate" ]] && return 0
  done
  return 1
}
