#!/usr/bin/env bash

speed::new() {
  local feet_per_round="$1"
  printf '%s' "$feet_per_round"
}

speed::feet_per_round() {
  local speed="$1"
  printf '%s' "$speed"
}
