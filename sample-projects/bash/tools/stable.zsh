#!/usr/bin/env zsh
# Extension variant .zsh: counts the centaurs in the paddock.

source "${0:A:h}/../lib/domain/model/dice.sh"

paddock::count_centaurs() {
  local -a centaurs=("$@")
  if (( ${#centaurs} > 0 )); then
    print -r -- "${#centaurs} centaurs in the paddock"
  fi
}

paddock::count_centaurs "$@"
