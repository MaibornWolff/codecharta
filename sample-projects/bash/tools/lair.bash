#!/usr/bin/env bash
# Extension variant .bash: lowers the portcullis of the lair.

source "$(dirname "${BASH_SOURCE[0]}")/../lib/domain/service/encounter_resolver.sh"

lair::lower_portcullis() {
  if encounter_resolver::is_empty; then
    printf 'the portcullis stays open\n'
  fi
}

lair::lower_portcullis
