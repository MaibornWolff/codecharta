import { isStandalone } from "../app/codeCharta/util/envDetector"

const HtmlWebpackPlugin = require("html-webpack-plugin")
const path = require("path")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")

const dist = path.resolve(__dirname, "../dist/webpack")

module.exports = {
	mode: "development",
	target: isStandalone() ? "node" : "web",
	entry: "./app/app.ts",
	output: {
		filename: "bundle.js",
		path: dist
	},
	devServer: {
		contentBase: dist,
		compress: true, // enable gzip compression
		hot: true, // hot module replacement. Depends on HotModuleReplacementPlugin
		port: 3000,
		clientLogLevel: "error"
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
	}
}
