#!/usr/bin/env bash

# shellcheck source=../domain/service/creature_service.sh
source "$(dirname "${BASH_SOURCE[0]}")/../domain/service/creature_service.sh"
# shellcheck source=../domain/model/creature.sh
source "$(dirname "${BASH_SOURCE[0]}")/../domain/model/creature.sh"
# shellcheck source=../domain/model/creature_id.sh
source "$(dirname "${BASH_SOURCE[0]}")/../domain/model/creature_id.sh"
# shellcheck source=../domain/model/creature_type.sh
source "$(dirname "${BASH_SOURCE[0]}")/../domain/model/creature_type.sh"
# shellcheck source=../domain/model/hit_points.sh
source "$(dirname "${BASH_SOURCE[0]}")/../domain/model/hit_points.sh"
# shellcheck source=../domain/model/speed_type.sh
source "$(dirname "${BASH_SOURCE[0]}")/../domain/model/speed_type.sh"
# shellcheck source=../domain/model/armor_class.sh
source "$(dirname "${BASH_SOURCE[0]}")/../domain/model/armor_class.sh"
# shellcheck source=dto/creature.sh
source "$(dirname "${BASH_SOURCE[0]}")/dto/creature.sh"

CREATURE_FACADE_STANDARD_CREATURE_TYPE="monstrosity"
CREATURE_FACADE_STABLE_TAG="centaur-stable"

# Returns the created creature through the nameref given as first argument.
creature_facade::create() {
  local -n created_creature="$1"
  local creature_type="$2"
  local walking_speed="$3"
  local flying_speed="$4"
  local swimming_speed="$5"
  local burrowing_speed="$6"
  local climbing_speed="$7"
  local armor_class="$8"
  local hit_points_value="$9"

  # Rolls initiative for every creature in the dungeon before the encounter starts.
  local new_creature
  new_creature="$(creature_id::new "$(creature_facade::generate_uuid)")"
  creature::new "$new_creature"
  creature::set_armor_class "$new_creature" "$armor_class"
  creature::set_hit_points "$new_creature" "$(hit_points::init "$hit_points_value")"
  creature::set_type "$new_creature" "$creature_type"

  # speed.sh is never sourced here: speed::new is reachable because creature.sh sourced it.
  creature::set_speed "$new_creature" walking "$(speed::new "$walking_speed")"
  creature::set_speed "$new_creature" flying "$(speed::new "$flying_speed")"
  creature::set_speed "$new_creature" swimming "$(speed::new "$swimming_speed")"
  creature::set_speed "$new_creature" burrowing "$(speed::new "$burrowing_speed")"
  creature::set_speed "$new_creature" climbing "$(speed::new "$climbing_speed")"

  creature_service::save "$new_creature"
  created_creature="$new_creature"
}

creature_facade::to_dto() {
  local creature="$1"
  dto::creature::new \
    "$(creature::id "$creature")" \
    "$(creature::type "$creature")" \
    "$(armor_class::total "$(creature::armor_class "$creature")")" \
    "$(hit_points::current "$(creature::hit_points "$creature")")"
}

creature_facade::stable_tag() {
  printf '%s' "$CREATURE_FACADE_STABLE_TAG"
}

creature_facade::generate_uuid() {
  if command -v uuidgen > /dev/null; then
    uuidgen | tr '[:upper:]' '[:lower:]'
  else
    date +%s%N
  fi
}
