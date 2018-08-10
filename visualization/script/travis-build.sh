#!/usr/bin/env bash

cd visualization
npm install
npm run build
npm run test --ci
npm run e2e --ci
npm run doc
npm run package
