#!/usr/bin/env node

// 1. Download the electron binaries
// 2. Build the standalone desktop apps
// 3. Zip the apps

const packager = require('electron-packager')

const downloadModule = require("./appDownload.js")
const electronVersion = require("../package.json").dependencies.electron.substring(1)

const DISTRIBUTIONS = {
  "win32" : ["ia32", "x64", "arm64"],
  "darwin" : ["x64", "arm64"],
  "linux" : ["x64", "arm64", "armv7l"]
};

await downloadModule.prepareBinaries()

async function build() {
  // set distributions to local ?
}

async function buildElectronApps() {
  const bundlePromises = []

  for (let [aPlatform, aArch] of Object.entries(DISTRIBUTIONS)) {
    aArch.forEach(anArchitecture =>
      bundlePromises.push(
        bundleElectronApp(
          version,
          {platform: aPlatform, arch: anArchitecture}
        )
      )
    )
  }

  return bundlePromises
}

async function bundleElectronApp(options) {
  return packager({
      ...options,
      asar: true,
      icon: 'app/codeCharta/assets/icon',
      electronZipDir: 'build/binaries'})
}

module.exports = {
  DISTRIBUTIONS: DISTRIBUTIONS,
  VERSION: electronVersion
}
