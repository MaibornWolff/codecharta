const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const path = require("path");
const CleanWebpackPlugin = require('clean-webpack-plugin')

const dist = path.resolve(__dirname, "../dist/webpack");

module.exports = {
    entry: "./app/app.ts",
    output: {
        filename: "bundle.js",
        path: dist
    },
    module: require("./webpack.loaders.js"),
    plugins: [
        new CleanWebpackPlugin([dist], {verbose: true, root: dist + "/.."}),
        new HtmlWebpackPlugin({
            template: "./app/index.html"
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