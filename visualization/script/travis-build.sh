#!/usr/bin/env bash

cd visualization
npm run cache clean
npm install
npm run test
npm run doc
npm run package