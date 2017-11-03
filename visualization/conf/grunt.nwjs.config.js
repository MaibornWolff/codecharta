const paths = require("./paths.js");

module.exports = {
    options: {
        platforms: ['win', 'linux'],
        buildDir: paths.packagePath,
        buildType: 'default',
        cacheDir: paths.cachePath
    },
    src: [paths.bundlePath + '/**/*', paths.packageJson, paths.license]
};