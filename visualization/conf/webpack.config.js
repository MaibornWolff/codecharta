const path = require('path');
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

const src = './app/';
const dist = path.resolve(__dirname, '../dist/webpack');

module.exports = {
    entry: src + 'app.js',
    output: {
        filename: 'bundle.js',
        path: dist
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loaders: [
                    'ng-annotate-loader',
                    'babel-loader'
                ]
            },
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
            },
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: [
                    'babel-loader', 'ts-loader'
                ],
                
            },
            {
                test: /\.glsl$/,
                loaders: ['webpack-glsl-loader']
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
    devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
      }
};