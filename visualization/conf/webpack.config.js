const path = require('path');
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

const paths = require("./paths.js");

const dist = path.resolve(__dirname, '.' + paths.bundlePath);

module.exports = {
    entry: paths.appEntry,
    output: {
        filename: paths.bundleName,
        path: dist
    },
    module: require("./webpack.loaders.js"),
    plugins: [
        new HtmlWebpackPlugin({
            template: paths.htmlEntry
        }),
        new BrowserSyncPlugin({
            host: 'localhost',
            port: 3000,
            server: {baseDir: [dist]}
        })
    ],
    devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
      }
};