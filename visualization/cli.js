#!/usr/bin/env node

const shell = require("shelljs")
const sanitized_dir = __dirname.replace('"', "")
shell.exec(`npm run --prefix "${sanitized_dir}" start 2>/dev/null`)
