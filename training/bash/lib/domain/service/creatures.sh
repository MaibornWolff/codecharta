#!/usr/bin/env bash
# Creatures: the port through which the domain stores and finds creatures.
# An adapter registers itself by setting CREATURES_PORT_IMPL to its function prefix.

# shellcheck source=../model/creature.sh
source "$(dirname "${BASH_SOURCE[0]}")/../model/creature.sh"
# shellcheck source=../model/creature_id.sh
source "$(dirname "${BASH_SOURCE[0]}")/../model/creature_id.sh"
# shellcheck source=../model/no_such_creature_exception.sh
source "$(dirname "${BASH_SOURCE[0]}")/../model/no_such_creature_exception.sh"

declare -g CREATURES_PORT_IMPL=""

creatures::register() {
  CREATURES_PORT_IMPL="$1"
}

creatures::save() {
  local creature="$1"
  "${CREATURES_PORT_IMPL}::save" "$creature"
}

creatures::find() {
  local creature_id="$1"
  "${CREATURES_PORT_IMPL}::find" "$creature_id"
}
