#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

if (process.platform !== 'win32' || process.env.npm_package_name !== "codecharta-analysis") {
  return;
}

(async () => {
    const bins = ["ccsh.ps1", "ccsh.cmd"];
    const globalOrLocal = process.env.npm_config_global === "true";
    const scriptLocation = globalOrLocal ? "binScripts/global" : "binScripts/local";
    const scriptTarget = globalOrLocal
      ? process.env.npm_config_global_prefix
      : path.join(process.env.npm_config_local_prefix, "node_modules/.bin");

    await Promise.all(bins.map((async (file) => {
      await fs.promises.copyFile(path.join(scriptLocation, file), path.join(scriptTarget, file));
      console.log(`${file} was moved to ${scriptTarget}`);
    })));
})();

