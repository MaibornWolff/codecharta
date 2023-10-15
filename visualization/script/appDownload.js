
const DISTRIBUTIONS = require("./appBuild")
const electronVersion = require("../package.json").dependencies.electron
const fs = require('fs-extra')

const DOWNLOAD_DIR = "build/binaries"
const version = // strip ^ from electronVersion

async function downloadAll (version) {
  console.log(`Downloading Electron v${version}`)
  const combinations = download.createDownloadCombos({ electronVersion: config.version, all: true }, targets.officialPlatforms, targets.officialArchs, skipDownloadingMacZips)

  await downloadElectronChecksum(version)
  return Promise.all(
    [
      ...combinations.map(combination => combination.arch === 'universal' ? null : downloadElectronZip(version, combination)),
      downloadElectronZip('6.0.0', {
        platform: 'darwin'
      })
    ]
  )
}


async function downloadElectronChecksum (version) {
  return downloadArtifact({
    isGeneric: true,
    cacheRoot: path.join(os.homedir(), '.electron'),
    version,
    artifactName: 'SHASUMS256.txt'
  })
}

async function downloadElectronZip (version, options) {
  return download.downloadElectronZip({
    ...options,
    artifactName: 'electron',
    cacheRoot: path.join(os.homedir(), '.electron'),
    version
  })
}

async function downloadElectron () {
  const versions = [
    config.version
  ]
  await Promise.all(versions.map(downloadAll))
}



async function cleanCacheFolder () {
  await fs.remove(DOWNLOAD_DIR)
  await fs.mkdirs(DOWNLOAD_DIR)
}


module.exports = {
  prepareBinaries: async function  () {
    await cleanCacheFolder()
    try {
      await downloadElectron()
    } catch (error) {
      console.error(error.stack || error)
      return process.exit(1)
    }
  },
  DOWNLOAD_DIR: DOWNLOAD_DIR
}
