#!/usr/bin/env bash

set -e
set -o pipefail
cd visualization
npm install
npm run build
npm run test --ci
npm run e2e --ci
npm run doc
npm run package
