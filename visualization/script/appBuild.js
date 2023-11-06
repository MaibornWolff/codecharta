#!/usr/bin/env node

const packager = require("electron-packager")
const path = require("node:path")

const { paths } = require("./appConfig.json")
const { cleanDirectory, createDarwinArmREADME } = require("./appUtils.js")

async function bundleElectronApp(options) {
	return packager({
		...options,
		asar: true,
		icon: "app/codeCharta/assets/icon",
		tmpdir: paths.tempPath
	})
}

async function buildElectronApps(version, distributions, downloadPath) {
	const bundlePromises = []

	for (let aPlatform in distributions) {
		let allArchitectures = distributions[aPlatform]
		for (const anArchitecture of allArchitectures) {
			bundlePromises.push(
				bundleElectronApp({
					platform: aPlatform,
					arch: anArchitecture,
					version: version,
					electronZipDir: downloadPath,
					dir: paths.webpackPath,
					out: paths.applicationPath
				})
			)
		}
	}

	return Promise.all(bundlePromises)
}

async function build(version, distributions, downloadPath) {
	cleanDirectory(paths.applicationPath)
	cleanDirectory(paths.tempPath)
	return buildElectronApps(version, distributions, downloadPath)
}

module.exports = {
	prepareApplications: async function (version, distributions, downloadPath) {
		await build(version, distributions, downloadPath)
		if (Object.hasOwn(distributions, "darwin")) {
			createDarwinArmREADME(path.join(paths.applicationPath, "codecharta-visualization-darwin-arm64/", "README.md"))
		}
	}
}
