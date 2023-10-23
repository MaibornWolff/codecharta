#!/usr/bin/env node

const fs = require('fs')
const path = require('node:path');
const { downloadArtifact } = require("@electron/get");

const { paths, distributions } = require("./appConfig.json");

var distributionCombos = {};

async function cleanDirectory(dir) {
  await fs.rm(dir, {recursive: true}, () => {console.log(`Removed ${dir}`);})
  await fs.mkdir(dir, () => {console.log(`Created ${dir}`);})
}

async function downloadElectronChecksum(version) {
  return downloadArtifact({
    isGeneric: true,
    cacheRoot: paths.binaryPath,
    version,
    artifactName: 'SHASUMS256.txt'
  })
}

async function downloadElectronZip(version, options) {
  return downloadArtifact({
    ...options,
    artifactName: 'electron',
    cacheRoot: paths.binaryPath,
    version
  })
}

async function downloadAll(version) {
  console.log(`Downloading Electron v${version}`);

  await downloadElectronChecksum(version);
  const downloadElectronPromises = [];
  console.log(`Building distributions: ${JSON.stringify(distributionCombos)}`);
  for (let [aPlatform, aArch] of Object.entries(distributionCombos)) {
    aArch.forEach(anArchitecture =>
      downloadElectronPromises.push(
        downloadElectronZip(
          version,
          { platform: aPlatform, arch: anArchitecture, tmp: false }
        )
      )
    )
  }

  return Promise.all(downloadElectronPromises)
}

async function download(version, buildLocal) {
  await cleanDirectory(paths.binaryPath)
  distributionCombos = buildLocal ? buildLocal : distributions;
  return downloadAll(version);
}

module.exports = {
  prepareBinaries: async function (version, buildLocal) {
    return download(version, buildLocal);
  }
}
