#!/usr/bin/env node

// Install scripts are disabled repository-wide (.npmrc ignore-scripts=true) to keep
// compromised dependencies from executing code during npm install. Electron is the one
// dependency that genuinely needs its postinstall (it downloads the platform binary),
// so the desktop scripts run this check first and fetch the binary on demand.

const { existsSync } = require("node:fs")
const { execSync } = require("node:child_process")
const { join } = require("node:path")

const electronPathFile = join(__dirname, "..", "node_modules", "electron", "path.txt")

if (!existsSync(electronPathFile)) {
    console.log("Electron binary is missing (install scripts are disabled) — downloading it now...")
    execSync("npm rebuild electron --ignore-scripts=false", { cwd: join(__dirname, ".."), stdio: "inherit" })
}
