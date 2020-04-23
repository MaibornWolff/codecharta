#!/usr/bin/env bash

set -e
set -o pipefail

echo "Building npm package"
cd visualization
npm install
npm run test
npm run build:web
npm run package

echo "Building docker image"
docker build -t maibornwolff/codecharta-visualization .
