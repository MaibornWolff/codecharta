#!/usr/bin/env node

const fs = require("fs")
const zip = require("bestzip")
const path = require("node:path")

const { paths } = require("./appConfig.json")

const { cleanDirectory } = require("./appUtils.js")

const getDirectories = srcPath => fs.readdirSync(srcPath).filter(file => fs.statSync(path.join(srcPath, file)).isDirectory())

async function zipApplications() {
	const zipPromises = []

	const allApplicationFolders = getDirectories(paths.applicationPath)
	allApplicationFolders.forEach(aPath => {
		zipPromises.push(
			zip({
				source: aPath,
				destination: path.join("../..", paths.packagePath, aPath + ".zip"),
				cwd: paths.applicationPath
			})
		)
	})
	zipPromises.push(
		zip({
			source: paths.webpackPath,
			destination: path.join(paths.packagePath, "web.zip"),
			cwd: path.resolve(".")
		})
	)

	return Promise.all(zipPromises)
}

async function zipEverything() {
	cleanDirectory(paths.packagePath)
	return zipApplications()
}

module.exports = {
	prepareZips: async function () {
		await zipEverything()
		return
	}
}
