#!/usr/bin/env node

const fs = require('fs');
const zip = require('bestzip');
const path = require('node:path');

const { paths } = require("./appConfig.json");

const getDirectories = srcPath => fs.readdirSync(srcPath).filter(file => fs.statSync(path.join(srcPath, file)).isDirectory());

async function cleanDirectory(dir) {
  await fs.rm(path.resolve(dir), () => {console.log(`Removed ${dir}`);})
  await fs.mkdir(path.resolve(dir), () => {console.log(`Created ${dir}`);})
}

async function zipApplications(){
  const zipPromises = []

  getDirectories(paths.applicationPath).forEach((aPath) => {
    zipPromises.push(
      zip({
        source: aPath,
        destination: path.join(paths.packagePath, aPath + ".zip"),
        cwd: path.resolve(paths.applicationPath)})
    )
  });
  zipPromises.push(zip({
    source: paths.webpackPath,
    destination: path.join(paths.packagePath, "web.zip"),
    cwd: path.resolve(".")
  }));

  return Promise.all(zipPromises);
}

async function zipEverything() {
  cleanDirectory(paths.packagePath);
  return zipApplications();
}

module.exports = {
  prepareZips : async function () {
    return zipEverything();
  }
}
