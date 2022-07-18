#!/bin/bash

check_runtime_ennvironment() {
  if [ $# -eq 0 ]; then
    echo "No arguments supplied."
    exit 0
  fi
  if [[ $1 == "-h" ]]; then
    echo "Generates a MetricGardener json for a specified project."
    exit 0
  fi
  command -v npm >/dev/null 2>&1 || {
    echo >&2 "npm is required but is not installed."
    exit 1
  }
}

check_supplied_path() {

  if [ ! -d "$1" ]; then
    echo "The supplied path is invalid."
    exit 0
  fi

}

check_runtime_ennvironment "$@"
check_supplied_path "$@"
npm install metric-gardener
npm exec metric-gardener "$1" -o "$1"/output.json
