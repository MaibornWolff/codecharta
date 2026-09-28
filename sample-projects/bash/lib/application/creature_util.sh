#!/usr/bin/env bash
# CreatureUtil: helpers on top of the whole domain model.

# Wildcard import: source every script of the model folder.
for model_script in "$(dirname "${BASH_SOURCE[0]}")"/../domain/model/*.sh; do
  # shellcheck disable=SC1090
  source "$model_script"
done
unset model_script

# Unused import.
# shellcheck source=../domain/model/fightable.sh
source "$(dirname "${BASH_SOURCE[0]}")/../domain/model/fightable.sh"

CREATURE_UTIL_STANDARD_ARMOR_CLASS_DESCRIPTION="Natural Armor"

: <<'BLOCK_COMMENT'
Counts the treasure hoard a creature guards.
BLOCK_COMMENT
creature_util::treasure_hoard() {
  local creature="$1"
  local xp_value
  xp_value="$(creature::xp_value "$creature")"
  printf '%s' $(( xp_value * 10 ))
}

creature_util::hoard_of_xp() {
  local xp_value="$1"
  printf '%s' $(( xp_value * 10 ))
}

creature_util::describe() {
  local creature="$1"
  printf '%s (%s), AC %s\n' \
    "$(creature::id "$creature")" \
    "$(creature::type "$creature")" \
    "$(armor_class::total "$(creature::armor_class "$creature")")"
}
