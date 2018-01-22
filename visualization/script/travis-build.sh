#!/usr/bin/env bash

cd visualization
npm install
npm run build
npm run test
npm run doc
npm run package
sonar-scanner