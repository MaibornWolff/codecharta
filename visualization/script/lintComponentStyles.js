#!/usr/bin/env node

/**
 * Enforces the `no-component-scss-files` architecture rule for real.
 *
 * dependency-cruiser can only see files reachable through import edges, and Angular's `styleUrl` is not
 * one — so a component .scss under app/codeCharta/ slips past `npm run lint:architecture` unnoticed.
 * This walk closes that hole: component styling belongs in daisyUI/Tailwind classes, and the only
 * stylesheets allowed are the global ones directly under app/.
 */

const fs = require("node:fs")
const path = require("node:path")

const COMPONENT_STYLES_ROOT = path.join(__dirname, "..", "app", "codeCharta")
const STYLESHEET_EXTENSIONS = [".scss", ".sass", ".css", ".less"]

function findStylesheets(directory) {
    const found = []
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const entryPath = path.join(directory, entry.name)
        if (entry.isDirectory()) {
            found.push(...findStylesheets(entryPath))
        } else if (STYLESHEET_EXTENSIONS.includes(path.extname(entry.name))) {
            found.push(entryPath)
        }
    }
    return found
}

const stylesheets = findStylesheets(COMPONENT_STYLES_ROOT)
if (stylesheets.length > 0) {
    const repositoryRoot = path.join(__dirname, "..")
    console.error("error no-component-scss-files: component stylesheets are not allowed under app/codeCharta/.")
    console.error("Use daisyUI/Tailwind classes instead; global styles live in app/app.scss + app/mixins.scss.\n")
    for (const stylesheet of stylesheets) {
        console.error(`  ${path.relative(repositoryRoot, stylesheet)}`)
    }
    process.exit(1)
}
