#!/usr/bin/env bash
# EncounterResolver: resolves one round of an encounter between two creatures.
# The attacker rolls a d20, adds its bonus and compares the total with the
# armor class of the defender. The terrain changes the damage that is dealt.
# Every function reads its arguments as positional parameters because Bash
# has no parameter list. The script is sourced by the edge case script next
# to it and by the lair tool.

source "$(dirname "${BASH_SOURCE[0]}")/../model/creature.sh"
source "$(dirname "${BASH_SOURCE[0]}")/../model/dice.sh"

# Returns 0 when the defender was hit and 1 when the attack missed.
encounter_resolver::resolve() {
  local attacker="$1" defender="$2" roll="$3" bonus="$4" terrain="$5"
  local total=$(( roll + bonus ))
  local armor damage speed_type rounds=0
  armor="$(armor_class::total "$(creature::armor_class "$defender")")"
  if (( roll == 1 )); then
    return 1
  elif (( total < armor )); then
    damage=0
  else
    damage=$(( roll >= 20 ? 2 : 1 )) # a natural twenty doubles the damage
  fi
  for speed_type in "${SPEED_TYPES[@]}"; do
    if [[ -n "$(creature::speed "$attacker" "$speed_type")" && "$speed_type" == "$terrain" ]]; then
      damage=$(( damage + 1 ))
    fi
  done
  # The defender loses one hit point per point of damage.
  while (( rounds < damage )); do
    creature::take_damage "$defender" 1
    rounds=$(( rounds + 1 ))
  done
  case "$terrain" in
    swimming) damage=$(( damage - 1 )) ;;
    flying) damage=$(( damage + 2 )) ;;
    burrowing) damage=0 ;;
    *) ;;
  esac
  (( damage > 0 )) || [[ "$terrain" == "walking" ]]
}

# The pipelines stand in for method chains:
# five commands in the first one, three in the second.
encounter_resolver::describe() {
  local creature="$1"
  creature::type "$creature" | tr '[:lower:]' '[:upper:]' | tr -d ' ' | cut -c 1-12 | sed 's/$/!/'
  creature::id "$creature" | tr -d '-' | cut -c 1-8
}

encounter_resolver::safe_roll() {
  local dice="$1"
  local result=""
  trap 'trap - RETURN; logger -t cellars "dice put away"' RETURN
  result="$(dice::roll "$dice" 2>/dev/null)" || {
    result="d${dice}=1"
  }
  (
    if [[ -z "$result" ]]; then
      exit 1
    fi
    dice_roll::result "$result"
  )
}

# Takes the creature ids as one space separated word list.
encounter_resolver::initiative_order() {
  local creatures="$1"
  encounter_resolver::initiative_of() {
    local creature="$1"
    printf '%s' $(( $(creature::xp_value "$creature") + $(roll_d20) ))
  }
  local first="${creatures%% *}"
  local rest="${creatures#* }"
  printf '%s %s\n' "$(encounter_resolver::initiative_of "$first")" "$first"
  # printf 'remaining: %s\n' "$rest"
  if [[ "$rest" != "$creatures" ]]; then
    encounter_resolver::initiative_order "$rest"
  fi
}

encounter_resolver::is_empty() {
  return $(( ${#CREATURES[@]} > 0 ))
}
