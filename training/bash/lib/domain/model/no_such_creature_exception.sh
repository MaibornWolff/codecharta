#!/usr/bin/env bash

NO_SUCH_CREATURE_EXIT_CODE=44

no_such_creature_exception::raise() {
  local creature_id="$1"
  echo "No such creature in the dungeon: ${creature_id}" >&2
  return "$NO_SUCH_CREATURE_EXIT_CODE"
}
