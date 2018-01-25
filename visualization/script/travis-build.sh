#!/usr/bin/env bash

echo "TEST"
echo $NPM_TOKEN
echo "TEST"

cd visualization
npm install
npm run build
npm run test
sonar-scanner || true
npm run doc
npm run package
