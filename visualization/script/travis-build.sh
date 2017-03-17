#!/usr/bin/env bash

node --version
npm --version
grunt --version

npm install
grunt build
grunt test