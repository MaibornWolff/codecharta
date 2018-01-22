#!/usr/bin/env bash

cd visualization
npm install
npm run build
npm run test
sonar-scanner
npm run doc
npm run package
