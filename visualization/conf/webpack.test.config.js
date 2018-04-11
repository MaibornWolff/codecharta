const path = require('path');
const webpack = require("webpack");

const src = './app/';
const dist = path.resolve(__dirname, '../dist/webpack');

process.env.NODE_ENV = 'test'; //reason: see .babelrc

function resolve(dir) {
    return path.join(__dirname, '..', dir)
}

module.exports = {
    entry: src + 'app.js',
    output: {
        filename: 'bundle.js',
        path: dist
    },
    module: require("./webpack.loaders.js"),
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.$': 'jquery',
            'window.jQuery': 'jquery'
        }),
        new webpack.LoaderOptionsPlugin({
            options: {},
            debug: true
        })
    ],
    devtool: 'source-map'
};