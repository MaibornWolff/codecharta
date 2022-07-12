#!/usr/bin/env node

const fs = require('fs');
const zip = require('bestzip');
const path = require('node:path');

fs.rmSync('./build', {recursive: true, force: true});
fs.rmSync('dist/packages', {recursive: true, force: true});

const NwBuilder = require('nw-builder');
const {log} = require("util");
const nw = new NwBuilder({
  buildDir: "dist/packages",
  cacheDir: "build",
  forceDownload: true,
  files: [
    "./dist/webpack/**/*",
    "package.json"
  ],
  flavor: "normal",
  version: "latest",
  // For debugging under Windows, remove osx64
  platforms: ["osx64", "win32", "win64", "linux32", "linux64"],
  appName: null,
  appVersion: null,
  buildType: function () {
    return this.appName + "-" + this.appVersion
  },
  useRcedit: true,
  zip: false,
  macIcns: './app/assets/icon.icns',
  winIco: './app/assets/icon.ico',
  winVersionString: {
    'CompanyName': 'MaibornWolff GmbH',
    'FileDescription': 'CodeCharta Visualization',
    'ProductName': 'codecharta-visualization',
    'LegalCopyright': 'Copyright MaibornWolff GmbH'
  }
});

(async () => {
  await nw.build();
  console.log("nw-build done!");
  fs.mkdirSync(nw.options.buildDir, {recursive: true});
  const baseZipPath = path.resolve(nw.options.buildDir, nw.options.appName + "-" + nw.options.appVersion + "-");
  const zipPromises = []
  nw._forEachPlatform((name, platform) => {
    zipPromises.push(
      zip({
        source: name,
        destination: baseZipPath + name + ".zip",
        cwd: path.join(platform.releasePath, "..")
      })
    )
  });
  zipPromises.push(zip({
    source: path.join("..", "webpack"),
    destination: baseZipPath + "web.zip",
    cwd: nw.options.buildDir
  }));

  await Promise.all([zipPromises]);
  console.log('Everything zipped')
})();
