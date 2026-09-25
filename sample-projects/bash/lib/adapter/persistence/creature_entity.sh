#!/usr/bin/env bash
# CreatureEntity: the persisted shape of a creature, encoded as "id|type".

CREATURE_ENTITY_DEFAULT_ID="ididid"

creature_entity::new() {
  local id="${1:-$CREATURE_ENTITY_DEFAULT_ID}"
  local creature_type="${2:-}"
  printf '%s|%s' "$id" "$creature_type"
}

creature_entity::id() {
  local entity="$1"
  printf '%s' "${entity%%|*}"
}

creature_entity::type() {
  local entity="$1"
  printf '%s' "${entity#*|}"
}
