#!/usr/bin/env bash
# Barrel: sourcing this file makes the whole application layer available.

[[ -n "${CELLARS_APPLICATION_LOADED:-}" ]] && return 0
readonly CELLARS_APPLICATION_LOADED=1

# shellcheck source=creature_facade.sh
source "$(dirname "${BASH_SOURCE[0]}")/creature_facade.sh"
# shellcheck source=creature_util.sh
source "$(dirname "${BASH_SOURCE[0]}")/creature_util.sh"
