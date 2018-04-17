#!/usr/bin/env bash

cd visualization
npm install
npm run build
npm run test
npm run e2e
npm run doc
npm run package
