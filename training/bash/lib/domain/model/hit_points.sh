#!/usr/bin/env bash
# Hit points drop when the creature takes damage and recover when it rests in its lair.

MAX_HIT_POINTS=999

# A hit points value is encoded as "current:max:temporary".
hit_points::new() {
  local current="$1"
  local max="$2"
  local temporary="${3:-0}"
  printf '%s:%s:%s' "$current" "$max" "$temporary"
}

hit_points::init() {
  local max="$1"
  if (( max > MAX_HIT_POINTS )); then
    max="$MAX_HIT_POINTS"
  fi
  hit_points::new "$max" "$max" 0
}

hit_points::current() {
  local hit_points="$1"
  printf '%s' "${hit_points%%:*}"
}

hit_points::damage() {
  local hit_points="$1"
  local damage="$2"
  local current max temporary
  IFS=':' read -r current max temporary <<< "$hit_points"
  hit_points::new $(( current - damage )) "$max" "$temporary"
}
