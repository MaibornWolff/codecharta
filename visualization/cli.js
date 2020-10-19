#!/usr/bin/env node

const shell = require("shelljs")
const sanitized_dir = __dirname.replace('"', "")
const silent = process.platform === ("win32" || "win64") ? ">nul 2>&1" : "2>/dev/null"

shell.exec(`npm run --prefix "${sanitized_dir}" start ${silent}`)
