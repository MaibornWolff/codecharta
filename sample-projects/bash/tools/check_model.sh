#!/usr/bin/env bash
# Loads every model script relative to the project root and checks the fightable contract.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

for model_script in lib/domain/model/*.sh; do
  # shellcheck disable=SC1090
  source "$model_script"
done
unset model_script

fightable::assert_implemented creature
fightable::assert_implemented centaur
echo "fightable: creature and centaur implement attack and take_damage"
