#!/usr/bin/env bash

# shellcheck source=creatures.sh
source "$(dirname "${BASH_SOURCE[0]}")/creatures.sh"
# shellcheck source=../model/creature.sh
source "$(dirname "${BASH_SOURCE[0]}")/../model/creature.sh"

creature_service::save() {
  local creature="$1"
  logger -t cellars "saving creature $(creature::id "$creature")"
  creatures::save "$creature"
}

creature_service::find() {
  local creature_id="$1"
  creatures::find "$creature_id"
}
