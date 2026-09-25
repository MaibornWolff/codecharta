#!/usr/bin/env bash
# ArmorClass, encoded as "base:bonus:description".

# shellcheck source=../../application/index.sh
source "$(dirname "${BASH_SOURCE[0]}")/../../application/index.sh"

armor_class::new() {
  local base="$1"
  local bonus="$2"
  local description="${3:-$CREATURE_UTIL_STANDARD_ARMOR_CLASS_DESCRIPTION}"
  printf '%s:%s:%s' "$base" "$bonus" "$description"
}

armor_class::total() {
  local armor_class="$1"
  local base bonus description
  IFS=':' read -r base bonus description <<< "$armor_class"
  printf '%s' $(( base + bonus ))
}

armor_class::description() {
  local armor_class="$1"
  printf '%s' "${armor_class##*:}"
}
