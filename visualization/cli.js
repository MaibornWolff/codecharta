#!/usr/bin/env node

const shell = require("shelljs")
shell.exec(`npm run --prefix ${__dirname} start`)
