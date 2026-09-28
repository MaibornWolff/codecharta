#!/usr/bin/env bash
# CreatureRepository: keeps creature entities in an associative array.

# shellcheck source=repository.sh
source "$(dirname "${BASH_SOURCE[0]}")/repository.sh"
# shellcheck source=creature_entity.sh
source "$(dirname "${BASH_SOURCE[0]}")/creature_entity.sh"

# Bash has no import alias; the closest idiom is a wrapper function under a shorter name.
entity::new() { creature_entity::new "$@"; }
entity::id() { creature_entity::id "$@"; }

declare -gA CREATURE_STORE

creature_repository::save() {
  local entity="$1"
  repository::save CREATURE_STORE "$(entity::id "$entity")" "$entity"
}

creature_repository::find_one() {
  local id="$1"
  repository::find_one CREATURE_STORE "$id"
}

creature_repository::find_all() {
  repository::find_all CREATURE_STORE
}
