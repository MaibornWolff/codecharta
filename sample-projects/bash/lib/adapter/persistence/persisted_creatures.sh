#!/usr/bin/env bash
# PersistedCreatures implements the creatures port on top of the creature repository.

# shellcheck source=creature_repository.sh
source "$(dirname "${BASH_SOURCE[0]}")/creature_repository.sh"
# shellcheck source=creature_entity.sh
source "$(dirname "${BASH_SOURCE[0]}")/creature_entity.sh"
# shellcheck source=../../domain/service/creatures.sh
source "$(dirname "${BASH_SOURCE[0]}")/../../domain/service/creatures.sh"
# shellcheck source=../../domain/model/creature.sh
source "$(dirname "${BASH_SOURCE[0]}")/../../domain/model/creature.sh"
# shellcheck source=../../domain/model/creature_id.sh
source "$(dirname "${BASH_SOURCE[0]}")/../../domain/model/creature_id.sh"
# shellcheck source=../../domain/model/no_such_creature_exception.sh
source "$(dirname "${BASH_SOURCE[0]}")/../../domain/model/no_such_creature_exception.sh"
# shellcheck source=../../application/index.sh
source "$(dirname "${BASH_SOURCE[0]}")/../../application/index.sh"

persisted_creatures::save() {
  local creature="$1"
  creature_repository::save "$(creature_entity::new "$(creature::id "$creature")" "$(creature::type "$creature")")"
}

persisted_creatures::find() {
  local creature_id="$1"
  local entity
  if ! entity="$(creature_repository::find_one "$(creature_id::value "$creature_id")")"; then
    no_such_creature_exception::raise "$creature_id"
    return $?
  fi
  local creature
  creature="$(creature_id::new "$(creature_entity::id "$entity")")"
  creature::new "$creature" "$CREATURE_FACADE_STANDARD_CREATURE_TYPE"
  printf '%s' "$creature"
}

creatures::register persisted_creatures
