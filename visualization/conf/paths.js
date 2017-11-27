const srcDir = "./app";
const distDir = "./dist";

module.exports = {
    sourcesRoot: srcDir,
    appEntry: srcDir + "/app.ts",
    htmlEntry: srcDir + "/index.html",
    bundlePath: distDir + "/webpack",
    bundleName: "bundle.js",
    bundle: distDir + "/webpack/bundle.js",
    testReportsPath: distDir + "/test-reports",
    coveragePath: distDir + "/coverage",
    specFiles: srcDir + "/**/*.spec.ts",
    packagePath: distDir + "/packages",
    cachePath: ".cache",
    packageJson: "./package.json",
    license: "./LICENSE.md",
    dist: distDir,
    docPath: distDir + "/doc"
};