#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
var isWindows = require("is-windows");

if (isWindows() === true && process.env.npm_package_name === "codecharta-analysis") {
  (async () => {
      const bins = ["ccsh.ps1", "ccsh.cmd"];
      const globalOrLocal = process.env.npm_config_global === "true";
      const scriptLocation = globalOrLocal ? "binScripts/global" : "binScripts/local";
      const scriptTarget = globalOrLocal
        ? process.env.npm_config_global_prefix
        : path.join(process.env.npm_config_local_prefix, "node_modules/.bin");

      await Promise.all(bins.map((async (file) => {
        try {
          await fs.promises.copyFile(path.join(scriptLocation, file), path.join(scriptTarget, file));
          console.log(`${file} was moved to ${scriptTarget}`);
        } catch (err) {
          console.error("File could not get copied")
          throw err
        }
      })));
  })();
}
