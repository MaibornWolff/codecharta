#!/usr/bin/env bash
# The creature DTO: same simple name as the domain creature, different package.
# It is a flat "id,type,armor,hit_points" line meant for printing and transport.

dto::creature::new() {
  local id="$1"
  local creature_type="$2"
  local armor_total="$3"
  local current_hit_points="$4"
  printf '%s,%s,%s,%s' "$id" "$creature_type" "$armor_total" "$current_hit_points"
}

dto::creature::id() {
  local dto="$1"
  printf '%s' "${dto%%,*}"
}
