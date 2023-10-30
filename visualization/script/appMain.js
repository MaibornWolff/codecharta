#!/usr/bin/env node

const { prepareApplications } = require("./appBuild");
const { prepareBinaries } = require("./appDownload");
const { prepareZips } = require("./appZip");
const config = require("./appConfig.json");

const electronVersion = require("../package.json").dependencies.electron;
const localFlag = process.argv[2];
const localCombo = {}
const localArch = process.arch;
localCombo[process.platform] = [localArch];

var distributions = (localFlag === "--local") ? localCombo : config.distributions;

(async () => {
  console.log(`Codecharta-Visualization package utility. Targets: ${JSON.stringify(distributions)}`)

  console.log("Build Step 1/3: Downloading binaries...");
  const downloadPath = await prepareBinaries(electronVersion, distributions);
  console.log("Build Step 2/3: Building applications...");
  await prepareApplications(electronVersion, distributions, downloadPath);
  console.log("Build Step 3/3: Zipping packages...");
  await prepareZips();
})();
