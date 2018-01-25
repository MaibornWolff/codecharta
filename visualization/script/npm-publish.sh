#!/usr/bin/env bash

cd visualization

echo "makeshifting .npmrc with Token from Travis settings"
./node_modules/.bin/makeshift -t $NPM_TOKEN

echo "publishing to npm"
npm publish --access public