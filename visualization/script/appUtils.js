#!/usr/bin/env node

const fs = require("fs")

const readmeInfo = `
If you can't execute the codecharta-visualization app, you might need to remove the 'downloaded' attributes from the OS:

$ xattr -cr codecharta-visualization.app/

> The OS might flag the executable as damaged, if it is downloaded and from an unverified developer

`

function cleanDirectory(dir) {
	fs.rmSync(dir, { recursive: true, force: true })
	fs.mkdirSync(dir, { recursive: true })
}

function createDarwinArmREADME(filePath) {
	fs.writeFileSync(filePath, readmeInfo, { encoding: "utf-8" })
}

module.exports.cleanDirectory = cleanDirectory
module.exports.createDarwinArmREADME = createDarwinArmREADME
