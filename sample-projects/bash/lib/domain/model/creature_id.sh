#!/usr/bin/env bash

creature_id::new() {
  local id="$1"
  printf '%s' "$id"
}

creature_id::value() {
  local creature_id="$1"
  printf '%s' "$creature_id"
}
