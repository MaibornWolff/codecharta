#!/usr/bin/env bash
# Die Zentaurenhöhle liegt unter dem Verlies. Rüstungsklasse und Trefferpunkte gehören zu jeder Kreatur.

source "$(dirname "${BASH_SOURCE[0]}")/creature.sh"

declare -gA ZENTAURENHOEHLE

zentaurenhöhle::new() {
  local ruestungsklasse="$1"
  ZENTAURENHOEHLE["rüstungsklasse"]="$ruestungsklasse"
}

zentaurenhöhle::rüstungsklasse() {
  printf '%s' "${ZENTAURENHOEHLE["rüstungsklasse"]}"
}

zentaurenhöhle::beschreibung() {
  printf '%s: %s\n' "Größe der Höhle" "$1"
}
