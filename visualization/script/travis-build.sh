#!/usr/bin/env bash

set -e
set -o pipefail

echo "Building npm package"
cd visualization
npm install
npm run build:web
npm run lint
npm run test --ci
npm run e2e --ci
npm run doc
npm run package

echo "Building docker image"
docker build -t maibornwolff/codecharta-visualization .
