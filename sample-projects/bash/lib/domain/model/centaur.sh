#!/usr/bin/env bash
# Centaur extends Creature: it reuses the creature functions and overrides the attack.

# shellcheck source=creature.sh
source "$(dirname "${BASH_SOURCE[0]}")/creature.sh"

CENTAUR_HOOF_DAMAGE=6

centaur::new() {
  local creature_id="$1"
  local centaur="$creature_id"
  creature::new "$centaur" beast
  creature::set_speed "$centaur" walking "$(speed::new 50)"
}

centaur::attack() {
  local centaur="$1"
  local target="$2"
  creature::take_damage "$target" "$CENTAUR_HOOF_DAMAGE"
}

centaur::take_damage() {
  creature::take_damage "$@"
}

fightable::assert_implemented centaur
