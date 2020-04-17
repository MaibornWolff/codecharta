#!/usr/bin/env bash

set -e
set -o pipefail

cd visualization
npm run build:web
npm run package
docker build -t maibornwolff/codecharta-visualization .
cd ..