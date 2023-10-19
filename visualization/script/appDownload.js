#!/usr/bin/env node

const fs = require('fs')
const path = require('node:path');
const {downloadArtifact} = require("@electron/get");

const { DISTRIBUTIONS, VERSION } = require("./appBuild")
const DOWNLOAD_DIR = "build/binaries"


async function downloadAll (version) {
  console.log(`Downloading Electron v${version}`)

  await downloadElectronChecksum(version)
  const downloadElectronPromises = [];

  for (let [aPlatform, aArch] of Object.entries(DISTRIBUTIONS)) {
    aArch.forEach(anArchitecture =>
      downloadElectronPromises.push(
        downloadElectronZip(
          version,
          {platform: aPlatform, arch: anArchitecture}
        )
      )
    )
  }

  return downloadElectronPromises
}


async function downloadElectronChecksum (version) {
  return downloadArtifact({
    isGeneric: true,
    cacheRoot: DOWNLOAD_DIR,
    version,
    artifactName: 'SHASUMS256.txt'
  })
}

async function downloadElectronZip (version, options) {
  return downloadArtifact({
    ...options,
    artifactName: 'electron',
    cacheRoot: DOWNLOAD_DIR,
    version
  })
}

async function cleanCacheFolder () {
  await fs.rm(path.resolve(DOWNLOAD_DIR), () => {console.log(`Removed ${DOWNLOAD_DIR}`);})
  await fs.mkdir(path.resolve(DOWNLOAD_DIR), () => {console.log(`Created ${DOWNLOAD_DIR}`);})
}


module.exports = {
  prepareBinaries: async function  () {
    await cleanCacheFolder()
    try {
      await downloadAll(VERSION)
    } catch (error) {
      console.error(error.stack || error)
      return process.exit(1)
    }
  },
  DOWNLOAD_DIR: DOWNLOAD_DIR
}
