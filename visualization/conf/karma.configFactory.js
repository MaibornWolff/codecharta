const paths = require("./paths.js");

module.exports = function (autoRun) {

    return function (config) {
        const configuration = {
            basePath: '../',
            singleRun: !autoRun,
            autoWatch: autoRun,
            logLevel: 'INFO',
            junitReporter: {
                outputDir: paths.testReportsPath
            },
            browsers: [
                'PhantomJS'
            ],
            frameworks: [
                'jasmine'
            ],
            files: [
                'node_modules/jquery/dist/jquery.js',
                'node_modules/angular/angular.js',
                'node_modules/three/build/three.js',
                'node_modules/angular-mocks/angular-mocks.js',
                'node_modules/es6-shim/es6-shim.js',
                paths.specFiles
            ],
            preprocessors: {
                [paths.specFiles]: [
                    'webpack'
                ]
            },
            reporters: ['junit', 'progress', 'coverage'],
            coverageReporter: {
                type: 'lcov',
                dir: paths.coveragePath,
                subdir: '.'
            },
            webpack: require('./webpack.test.config.js'),
            webpackMiddleware: {
                noInfo: true
            },
            plugins: [
                require('karma-jasmine'),
                require('karma-junit-reporter'),
                require('karma-coverage'),
                require('karma-phantomjs-launcher'),
                require('karma-phantomjs-shim'),
                require('karma-webpack')

            ],
            devtool: 'source-map'
        };

        config.set(configuration);
    };

};
