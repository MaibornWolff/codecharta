#!/usr/bin/env bash
# Two declarations in one file: dice (a die with n sides) and dice_roll (the result of one roll).

dice::new() {
  local sides="$1"
  printf '%s' "$sides"
}

dice::roll() {
  local dice="$1"
  dice_roll::new "$dice" $(( RANDOM % dice + 1 ))
}

dice_roll::new() {
  local dice="$1"
  local result="$2"
  printf 'd%s=%s' "$dice" "$result"
}

dice_roll::result() {
  local dice_roll="$1"
  printf '%s' "${dice_roll#*=}"
}

# A free function next to the two declarations.
roll_d20() {
  local d20Roll
  d20Roll="$(dice::roll "$(dice::new 20)")"
  dice_roll::result "$d20Roll"
}
