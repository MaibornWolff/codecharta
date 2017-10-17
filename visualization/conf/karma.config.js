module.exports = function (config) {
    const configuration = {
        basePath: '../',
        singleRun: true,
        autoWatch: false,
        logLevel: 'INFO',
        junitReporter: {
            outputDir: 'dist/test-reports'
        },
        browsers: [
            'PhantomJS'
        ],
        frameworks: [
            'jasmine',
            //'sinon-chai'
        ],
        //client: {
        //    chai: {
        //        includeStack: true
        //    }
        //},
        files: [
            'node_modules/jquery/dist/jquery.js',
            'node_modules/angular/angular.js',
            //'node_modules/three/build/three.js',
            'node_modules/angular-mocks/angular-mocks.js',
            //'node_modules/es6-shim/es6-shim.js',
            'app/**/*.spec.ts'
        ],
        preprocessors: {
            ['app/**/*.spec.ts']: [
                'webpack'
            ]
        },
        reporters: ['junit', 'progress', 'coverage'],
        coverageReporter: {
            type: 'lcov',
            dir: 'dist/coverage/',
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
            //require('karma-sinon-chai'),
            require('karma-phantomjs-launcher'),
            require('karma-phantomjs-shim'),
            require('karma-webpack')

        ],
        devtool: 'source-map'
    };

    config.set(configuration);
};