#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

(async () => {
    if (process.env.npm_package_name === "codecharta-analysis") {
		const bins = ["ccsh.ps1", "ccsh.cmd"];
		const globalOrLocal = process.env.npm_config_global === "true";
		const scriptLocation = globalOrLocal ? "binScripts/global" : "binScripts/local";
		const scriptTarget = globalOrLocal
			? process.env.npm_config_global_prefix
			: path.join(process.env.npm_config_local_prefix, "node_modules/.bin");
		var deletionPromises = [];

		bins.forEach(file => {
			deletionPromises.push(
				new Promise((res, rej) => {
					try {
						fs.copyFile(path.join(scriptLocation, file), path.join(scriptTarget, file), err => {
							if (err) throw err;
							console.log(`${file} was moved`);
							res();
						})
					} catch (err) {
						console.error(err);
						rej(err);
					}
				})
			)
		})
		await Promise.allSettled(deletionPromises);
	}
})();
