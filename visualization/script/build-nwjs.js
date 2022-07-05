#!/usr/bin/env node

const NwBuilder = require('nw-builder');
const nw = new NwBuilder({
  buildDir: "./dist/packages/",
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
  buildType: "versioned",
  zip: true,
  useRcedit: true,
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
  console.log('done');
}).catch(function (error) {
  console.error('nw-builder error: '+error);
})

