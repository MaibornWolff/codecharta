#!/usr/bin/env bash
# A creature that roams the cellar. Centaurs, beasts and dragons all share hit points, armor class and speeds.

# shellcheck source=fightable.sh
source "$(dirname "${BASH_SOURCE[0]}")/fightable.sh"
# shellcheck source=creature_id.sh
source "$(dirname "${BASH_SOURCE[0]}")/creature_id.sh"
# shellcheck source=creature_type.sh
source "$(dirname "${BASH_SOURCE[0]}")/creature_type.sh"
# shellcheck source=armor_class.sh
source "$(dirname "${BASH_SOURCE[0]}")/armor_class.sh"
# shellcheck source=speed_type.sh
source "$(dirname "${BASH_SOURCE[0]}")/speed_type.sh"
# shellcheck source=speed.sh
source "$(dirname "${BASH_SOURCE[0]}")/speed.sh"
# shellcheck source=hit_points.sh
source "$(dirname "${BASH_SOURCE[0]}")/hit_points.sh"
# shellcheck source=../../application/index.sh
. "$(dirname "${BASH_SOURCE[0]}")/../../application/index.sh"

# Every creature lives in one associative array keyed by "<id>.<field>".
declare -gA CREATURES

creature::new() {
  local creature_id="$1"
  local creature_type="${2:-$CREATURE_FACADE_STANDARD_CREATURE_TYPE}"
  CREATURES["${creature_id}.id"]="$(creature_id::value "$creature_id")"
  CREATURES["${creature_id}.type"]="$creature_type"
  CREATURES["${creature_id}.xp_value"]=0
}

creature::id() {
  local creature="$1"
  printf '%s' "${CREATURES["${creature}.id"]}"
}

creature::type() {
  local creature="$1"
  printf '%s' "${CREATURES["${creature}.type"]}"
}

creature::set_type() {
  local creature="$1"
  local creature_type="$2"
  creature_type::is_valid "$creature_type" || return 1
  CREATURES["${creature}.type"]="$creature_type"
}

creature::set_armor_class() {
  local creature="$1"
  local armor_class="$2"
  CREATURES["${creature}.armor_class"]="$armor_class"
}

creature::armor_class() {
  local creature="$1"
  printf '%s' "${CREATURES["${creature}.armor_class"]}"
}

creature::set_speed() {
  local creature="$1"
  local speed_type="$2"
  local speed="$3"
  speed_type::is_valid "$speed_type" || return 1
  CREATURES["${creature}.speed.${speed_type}"]="$(speed::feet_per_round "$speed")"
}

creature::speed() {
  local creature="$1"
  local speed_type="$2"
  printf '%s' "${CREATURES["${creature}.speed.${speed_type}"]}"
}

creature::set_hit_points() {
  local creature="$1"
  local hit_points="$2"
  CREATURES["${creature}.hit_points"]="$hit_points"
}

creature::hit_points() {
  local creature="$1"
  printf '%s' "${CREATURES["${creature}.hit_points"]}"
}

creature::xp_value() {
  local creature="$1"
  printf '%s' "${CREATURES["${creature}.xp_value"]}"
}

creature::attack() {
  local creature="$1"
  local target="$2"
  creature::take_damage "$target" 1
}

creature::take_damage() {
  local creature="$1"
  local damage="$2"
  local hit_points
  hit_points="$(creature::hit_points "$creature")"
  CREATURES["${creature}.hit_points"]="$(hit_points::damage "$hit_points" "$damage")"
}

fightable::assert_implemented creature
