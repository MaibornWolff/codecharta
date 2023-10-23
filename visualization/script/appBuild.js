#!/usr/bin/env node

const packager = require('electron-packager');
const fs = require('fs');
const path = require('node:path');

const { paths, distributions } = require("./appConfig.json")
var distributionCombos = {};

async function cleanDirectory(dir) {
  await fs.rm(path.resolve(dir), () => {console.log(`Removed ${dir}`);})
  await fs.mkdir(path.resolve(dir), () => {console.log(`Created ${dir}`);})
}

async function bundleElectronApp(options) {
  return packager({
      ...options,
      asar: true,
      icon: 'app/codeCharta/assets/icon',
      })
}

async function buildElectronApps(version) {
  const bundlePromises = []
  console.log(`Building distributions: ${JSON.stringify(distributionCombos)}`);

  for (let [aPlatform, aArch] of Object.entries(distributionCombos)) {
    aArch.forEach(anArchitecture =>
      bundlePromises.push(
        bundleElectronApp({
          platform: aPlatform,
          arch: anArchitecture,
          version: version,
          electronZipDir: paths.binaryPath,
          dir: paths.webpackPath,
          out: paths.applicationPath}
        )
      )
    );
  }

  return Promise.all(bundlePromises)
}

async function build(version, buildLocal) {
  await cleanDirectory(paths.applicationPath);
  distributionCombos = buildLocal ? buildLocal : distributions;
  return buildElectronApps(version);
}

module.exports = {
  prepareApplications: async function (version, buildLocal) {
    return build(version, buildLocal);
  }
}
