#!/usr/bin/env node

const { prepareApplications } = require("./appBuild")
const { prepareBinaries } = require("./appDownload")
const { prepareZips } = require("./appZip")
const config = require("./appConfig.json")
const assert = require("assert")

const electronVersion = require("../package.json").dependencies.electron
const versionRegex = /^\d+\.\d+\.\d+/
const localFlag = process.argv[2]
const localCombo = {}
const localArch = process.arch
localCombo[process.platform] = [localArch]

var distributions = localFlag === "--local" ? localCombo : config.distributions

async function main() {
    console.log(`Codecharta-Visualization package utility. Targets: ${JSON.stringify(distributions)}`)
    assert(versionRegex.test(electronVersion), "Error: Please specify exact version of electron in package.json without caret etc.")

    console.log("Build Step 1/3: Downloading binaries...")
    const downloadPath = await prepareBinaries(electronVersion, distributions)
    console.log("Build Step 2/3: Building applications...")
    await prepareApplications(electronVersion, distributions, downloadPath)
    console.log("Build Step 3/3: Zipping packages...")
    await prepareZips()
}

main()
    .then(() => {
        console.log("Done!")
        process.exit(0)
    })
    .catch(err => {
        console.error(err) // Writes to stderr
        process.exit(1)
    })
