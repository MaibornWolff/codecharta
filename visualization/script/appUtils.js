#!/usr/bin/env node

const fs = require('fs')

function cleanDirectory(dir) {
  fs.rmSync(dir, {recursive: true, force: true});
  fs.mkdirSync(dir);
}

module.exports.cleanDirectory = cleanDirectory;
