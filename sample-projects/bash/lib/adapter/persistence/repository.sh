#!/usr/bin/env bash
# Repository: a generic store. Bash has no generics; the store is passed by name
# and bound with a nameref, so any associative array works as the backing map.

repository::save() {
  local -n store="$1"
  local key="$2"
  local value="$3"
  store["$key"]="$value"
}

repository::find_one() {
  local -n store="$1"
  local key="$2"
  [[ -v store["$key"] ]] || return 1
  printf '%s' "${store["$key"]}"
}

repository::find_all() {
  local -n store="$1"
  printf '%s\n' "${store[@]}"
}
