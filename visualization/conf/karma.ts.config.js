module.exports = function (config) {
    const configuration = {
        basePath: '../',
        singleRun: false,
        autoWatch: true,
        logLevel: 'INFO',
        browsers: [
            'PhantomJS'
        ],
        frameworks: [
            'jasmine'
        ],
        files: [
            'node_modules/angular/angular.js',
            'node_modules/angular-mocks/angular-mocks.js',
            'app/app.spec.js'
        ],
        preprocessors: {
            ['app/app.spec.js']: [
                'webpack'
            ]
        },
        webpack: require('./webpack.test.config.js'),
        webpackMiddleware: {
            noInfo: true
        },
        plugins: [
            require('karma-jasmine'),
            require('karma-junit-reporter'),
            require('karma-coverage'),
            require('karma-sinon-chai'),
            require('karma-phantomjs-launcher'),
            require('karma-phantomjs-shim'),
            require('karma-webpack')

        ],
        devtool: 'source-map'
    };

    config.set(configuration);
};