#!/usr/bin/env bash

cd analysis/node-wrapper

echo "installin gnode-wrapper"
npm install

echo "makeshifting .npmrc with Token from Travis settings"
./node_modules/.bin/makeshift -t $NPM_TOKEN

echo "publishing to npm"
npm publish --access public
