#!/usr/bin/env node

const fs = require("fs")
const path = require("node:path")
const { downloadArtifact } = require("@electron/get")

const { paths } = require("./appConfig.json")
const { cleanDirectory } = require("./appUtils.js")

var localDistributions = {}

async function downloadElectronChecksum(version) {
	return downloadArtifact({
		isGeneric: true,
		cacheRoot: paths.binaryPath,
		version,
		artifactName: "SHASUMS256.txt"
	})
}

async function downloadElectronZip(version, options) {
	return downloadArtifact({
		...options,
		artifactName: "electron",
		cacheRoot: paths.binaryPath,
		version
	})
}

async function downloadAll(version, distributions) {
	console.log(`Downloading Electron v${version}`)

	await downloadElectronChecksum(version)
	const downloadElectronPromises = []
	for (const aPlatform in distributions) {
		let allArchitectures = distributions[aPlatform]
		allArchitectures.forEach(architectureEntry => {
			downloadElectronPromises.push(downloadElectronZip(version, { platform: aPlatform, arch: architectureEntry }))
		})
	}

	return Promise.all(downloadElectronPromises)
}

async function download(version, distributions) {
	cleanDirectory(paths.binaryPath)

	return downloadAll(version, distributions)
}

module.exports = {
	prepareBinaries: async function (version, distributions) {
		const downloadPaths = await download(version, distributions)
		return path.dirname(downloadPaths[0])
	}
}
