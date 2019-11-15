const HtmlWebpackPlugin = require("html-webpack-plugin")
const path = require("path")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")

module.exports = {
	entry: "./app/app.ts",
	output: {
		filename: "bundle.js",
		path: dist
	},
	module: require("./webpack.loaders.js"),
	plugins: [
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			template: "./app/index.html"
		})
	],
	devtool: "source-map",
	resolve: {
		extensions: [".ts", ".tsx", ".js"]
	},
	devServer: {
		contentBase: "./dist",
		compress: true, // enable gzip compression
		historyApiFallback: true, // true for index.html upon 404, object for multiple paths
		hot: true, // hot module replacement. Depends on HotModuleReplacementPlugin
		https: false, // true for self-signed, object for cert authority
		noInfo: true // only errors & warns on hot reload
	}
}
