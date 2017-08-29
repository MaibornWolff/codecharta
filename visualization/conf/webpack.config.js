const path = require('path');
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

const src = './app/';
const dist = path.resolve(__dirname, '../dist/webpack');

function resolve(dir) {
    return path.join(__dirname, '..', dir)
}

module.exports = {
    entry: src + 'app.js',
    output: {
        filename: 'bundle.js',
        path: dist
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                loaders: [
                    'html-loader'
                ]
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.(png|svg|jpg|gif)$/, use: [
                'file-loader'
            ]
            },
            {
                test: /\.(json)$/, use: [
                'json-loader'
            ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    'file-loader'
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: src + 'index.html'
        }),
        new BrowserSyncPlugin({
            host: 'localhost',
            port: 3000,
            server: {baseDir: [dist]}
        })
    ],
};