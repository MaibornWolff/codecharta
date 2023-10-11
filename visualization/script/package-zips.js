#!/usr/bin/env node

const fs = require('fs');
const zip = require('bestzip');
const path = require('node:path');

fs.rmSync("dist/packages", {recursive: true, force: true});
const getDirectories = srcPath => fs.readdirSync(srcPath).filter(file => fs.statSync(path.join(srcPath, file)).isDirectory());

(async () => {
  const baseZipPath = path.resolve("dist/packages");
  const applicationPath = "dist/applications"
  fs.mkdirSync(baseZipPath, {recursive: true});

  const zipPromises = []
  getDirectories(applicationPath).forEach((aPath) => {
    zipPromises.push(
      zip({
        source: aPath,
        destination: path.join(baseZipPath, aPath + ".zip"),
        cwd: path.resolve(applicationPath)})
    )
  });
  zipPromises.push(zip({
    source: "webpack",
    destination: path.join(baseZipPath, "web.zip"),
    cwd: path.resolve("dist/")
  }));

  await Promise.all(zipPromises);
  console.log('Everything zipped')
})();
