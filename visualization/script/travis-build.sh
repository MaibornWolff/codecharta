#!/usr/bin/env bash

cd visualization
npm install
npm run build

echo "makeshifting .npmrc with Token from Travis settings"
./node_modules/.bin/makeshift -t $NPM_TOKEN
echo "npm whoami for check"
npm whoami

npm run test
sonar-scanner || true
npm run doc
npm run package
