#!/usr/bin/env node

const fs = require('fs');
const zip = require('bestzip');
const path = require('node:path');

fs.rmSync('./build', { recursive: true, force: true });
fs.rmSync('dist/packages', { recursive: true, force: true });

const NwBuilder = require('nw-builder');
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
  platforms: ["osx64", "win32", "win64", "linux32", "linux64"],
  appName: null,
  appVersion: null,
  buildType: function () { return this.appName + "-" + this.appVersion },
  useRcedit: true,
  zip: false,
  macIcns: './app/assets/icon.icns',
  winIco:'./app/assets/icon.ico',
  winVersionString: {
    'CompanyName': 'MaibornWolff GmbH',
    'FileDescription': 'CodeCharta Visualization',
    'ProductName': 'codecharta-visualization',
    'LegalCopyright': 'Copyright MaibornWolff GmbH'
  }
});
nw.build().then(function () {
  console.log("nw-build done!");
  fs.mkdirSync(nw.options.buildDir, { recursive: true });
  const baseZipPath = path.resolve(nw.options.buildDir, nw.options.appName + "-" + nw.options.appVersion + "-");
  nw._forEachPlatform(function (name, platform) {
    zip({
      source:name,
      destination: baseZipPath + name + ".zip",
      cwd: path.join(platform.releasePath, "..")
    }).then(function () {
      console.log(name + " zipped!")
    }).catch(function (err) {
      console.error(err.stack)
      process.exit(1)
    });
  });

  zip({
    source: path.join("..", "webpack"),
    destination: baseZipPath + "web.zip",
    cwd: nw.options.buildDir
  }).then(function () {
    console.log("web zipped!")
  }).catch(function (err) {
    console.error(err.stack)
    process.exit(1)
  });
  // console.log('done');
}).catch(function (error) {
  console.error('nw-builder error: '+error);
});


