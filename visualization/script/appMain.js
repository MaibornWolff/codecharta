const { prepareApplications } = require("./appBuild");
const { prepareBinaries } = require("./appDownload");
const { prepareZips } = require("./appZip");

// TODO: Download return path of zip -> use it in building?

const electronVersion = require("../package.json").dependencies.electron.substring(1);
const localFlag = process.argv[2];
const localCombo = {}
const localArch = process.arch;
localCombo[process.platform] = [localArch]

const distributions = (localFlag === "--local") ? localCombo : undefined;

// 1. Download the electron binaries
// 2. Build the standalone desktop apps
// 3. Zip the apps

(async () => {
  console.log("Build Step 1/3: Downloading binaries...");
  await prepareBinaries(electronVersion, distributions);
  console.log("Build Step 2/3: Building applications...");
  await prepareApplications(electronVersion, distributions);
  console.log("Build Step 3/3: Zipping packages...");
  await prepareZips();
})();
