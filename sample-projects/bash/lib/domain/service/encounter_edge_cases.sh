#!/usr/bin/env bash
# EncounterEdgeCases: one function per Bash construct a parser is likely to miscount.

source "$(dirname "${BASH_SOURCE[0]}")/encounter_resolver.sh"
[[ -r "$(dirname "${BASH_SOURCE[0]}")/../model/zentaurenhöhle.sh" ]] && source "$(dirname "${BASH_SOURCE[0]}")/../model/zentaurenhöhle.sh"

alias ambush='encounter_edge_cases::list_and_or'

encounter_edge_cases::double_bracket_and() {
  if [[ -n "$1" && -n "$2" ]]; then
    printf 'both creatures are in the cellar\n'
  fi
}

encounter_edge_cases::double_bracket_or() {
  [[ "$1" == "centaur" || "$1" == "dragon" ]]
}

encounter_edge_cases::list_and_or() {
  creature::id "$1" > /dev/null && printf 'ambush\n' || printf 'retreat\n'
}

encounter_edge_cases::case_alternatives() {
  case "$1" in
    beast | monstrosity | aberration) printf 'wild\n' ;;
    fiend | undead) printf 'cursed\n' ;;
    *) printf 'tame\n' ;;
  esac
}

encounter_edge_cases::case_fallthrough() {
  case "$1" in
    dragon) printf 'breathes fire\n' ;&
    celestial) printf 'flies\n' ;;&
    humanoid) printf 'walks\n' ;;
  esac
}

encounter_edge_cases::until_loop() {
  local torches="$1"
  until (( torches == 0 )); do
    torches=$(( torches - 1 ))
  done
}

encounter_edge_cases::select_menu() {
  local weapon
  select weapon in lance bow hoof; do
    printf '%s\n' "$weapon"
    break
  done
}

encounter_edge_cases::c_style_for() {
  local round
  for (( round = 0; round < $1; round++ )); do
    printf 'round %s\n' "$round"
  done
}

encounter_edge_cases::implicit_argument_loop() {
  local creature
  for creature; do
    printf '%s\n' "$creature"
  done
}

encounter_edge_cases::labelled_break() {
  local attacker defender
  for attacker in "$@"; do
    for defender in "$@"; do
      if [[ "$attacker" == "$defender" ]]; then
        continue 2
      fi
      break 2
    done
  done
}

encounter_edge_cases::while_read_or() {
  local line
  while IFS= read -r line || [[ -n "$line" ]]; do
    printf '%s\n' "$line"
  done < <(printf 'goblin\nkobold')
}

encounter_edge_cases::getopts_loop() {
  local option
  while getopts 'ab:' option; do
    case "$option" in
      a) printf 'ambush\n' ;;
      b) printf 'bonus %s\n' "$OPTARG" ;;
      *) return 1 ;;
    esac
  done
}

encounter_edge_cases::heredoc_with_hash() {
  cat <<SCROLL
# this line is heredoc text, not a comment
if the creature sleeps && the door is open || the torch is out; then
  # neither is this one
fi
SCROLL
}

encounter_edge_cases::heredoc_block_comment() {
  : <<'NOTE'
The moat is a no-op heredoc used as a block comment.
while it lasts; do nothing; done
NOTE
  printf 'moat\n'
}

encounter_edge_cases::multi_line_string() {
  local scroll="The gargoyle watches the gate
# and this hash is inside the string
if it wakes && it attacks, run"
  printf '%s\n' "$scroll"
}

encounter_edge_cases::comment_markers_in_strings() {
  local trinkets=(amulet ring)
  printf '%s\n' "# not a comment" '# not a comment either'
  printf '%s %s %s\n' "$#" "${#trinkets[@]}" "${1#prefix}"
  printf '%s\n' "${trinkets[@]/#/cursed-}" amulet#ring
}

encounter_edge_cases::default_expansion() {
  local terrain="${1:-walking}"
  local bonus="${2:=0}"
  local hint="${3:+hidden}"
  : "${terrain:?terrain is required}"
  printf '%s %s %s\n' "$terrain" "$bonus" "$hint"
}

encounter_edge_cases::arithmetic_logic() {
  (( $1 > 0 && $2 > 0 || $3 ))
}

encounter_edge_cases::arithmetic_ternary() {
  printf '%s\n' $(( $1 > $2 ? $1 : $2 ))
}

encounter_edge_cases::single_bracket_dash_a() {
  if [ -n "$1" -a -n "$2" ]; then
    printf 'two potions\n'
  fi
}

encounter_edge_cases::if_elif_else() {
  if ! creature::id "$1" > /dev/null; then
    printf 'nobody\n'
  elif [[ "$2" == "lair" ]]; then
    printf 'at home\n'
  elif [[ "$2" == "dungeon" ]]; then
    printf 'on patrol\n'
  else
    printf 'wandering\n'
  fi
}

encounter_edge_cases::one_liner() { if [[ -n "$1" ]]; then printf 'one\n'; fi; for trap_door in "$@"; do printf '%s\n' "$trap_door"; done; }

encounter_edge_cases::if_in_command_substitution() {
  local verdict
  verdict="$(if (( $1 > 10 )); then printf 'deadly'; else printf 'easy'; fi)"
  printf '%s\n' "$verdict"
}

function encounter_edge_cases::function_keyword {
  printf 'function keyword without parentheses\n'
}

function encounter_edge_cases::function_keyword_parentheses() {
  printf 'function keyword with parentheses\n'
}

encounter_edge_cases::subshell_body() (
  cd /tmp || exit 1
  printf 'the subshell keeps its directory to itself\n'
)

encounter_edge_cases::test_body() [[ "$1" -lt "$2" ]]

roll-initiative() {
  roll_d20
}

encounter_edge_cases::trap_string() {
  local scratch
  scratch="$(mktemp)"
  trap 'if [[ -f "$scratch" ]]; then rm -f "$scratch" && printf "swept\n"; fi' EXIT
}

encounter_edge_cases::positional_parameters() {
  local attacker="$1" defender="$2" weapon="$3"
  shift 3
  printf '%s hits %s with %s (%s more, all: %s)\n' "$attacker" "$defender" "$weapon" "$#" "$*"
}

encounter_edge_cases::long_pipeline() {
  printf '%s\n' "$@" |
    sort |
    uniq -c |
    sort -rn |
    head -n 3 |
    awk '{ print $2 }'
}

encounter_edge_cases::pipeline_stderr() {
  creature::id "$1" |& tr -d '-' |& cut -c 1-4 |& tr '[:lower:]' '[:upper:]'
}

encounter_edge_cases::line_continuation() {
  printf '%s %s %s\n' \
    "$1" \
    "$2" \
    "$3"
}

encounter_edge_cases::background_and_wait() {
  roll_d20 > /dev/null &
  roll_d20 > /dev/null &
  wait
}

encounter_edge_cases::lazy_source() {
  source "$(dirname "${BASH_SOURCE[0]}")/../model/centaur.sh"
  centaur::new "$1"
}

encounter_edge_cases::arithmetic_body() (( $1 < $2 / 2 ))
