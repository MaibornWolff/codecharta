const path = require('path');
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');

const src = './app/';
const dist = path.resolve(__dirname, '../dist/webpack');

function resolve (dir) {
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
    /*resolve: {
        extensions: ['.js'],
        alias: {
            'jquery': resolve('node_modules/jquery/dist/jquery'),
            'jQuery': resolve('node_modules/jquery/dist/jquery')
        }
    },*/
    plugins: [
        new HtmlWebpackPlugin({
            template: src + 'index.html'
        })/*,
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.$': 'jquery',
            'window.jQuery': 'jquery',
        })*/
    ],
};