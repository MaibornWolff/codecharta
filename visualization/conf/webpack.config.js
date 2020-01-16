const HtmlWebpackPlugin = require("html-webpack-plugin")
const path = require("path")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")

const dist = path.resolve(__dirname, "../dist/webpack")

module.exports = env => {
	exports = {
		mode: "development",
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
	if (env.STANDALONE === "true") {
		exports.target = "node"
	}
	return exports
}
