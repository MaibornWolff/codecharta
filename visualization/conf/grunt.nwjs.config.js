const paths = require("./paths.js");

module.exports = {
    options: {
        platforms: ['win', 'mac'],
        buildDir: paths.packagePath,
        buildType: 'default',
        cacheDir: paths.cachePath
    },
    src: [paths.bundlePath + '/**/*', paths.packageJson, paths.license]
};