const HtmlWebpackPlugin = require("html-webpack-plugin")
const path = require("path")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const { DefinePlugin } = require("webpack")
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")
const dist = path.resolve(__dirname, "../dist/webpack")
const TerserPlugin = require("terser-webpack-plugin")

module.exports = env => {
	const config = {
		mode: "development",
		target: "web",
		entry: "./app/app.module.ts",
		output: {
			filename: "bundle.js",
			path: dist
		},
		devServer: {
			static: {
				directory: dist
			},
			compress: true, // enable gzip compression
			hot: true, // hot module replacement. Depends on HotModuleReplacementPlugin
			port: 3000,
			client: {
				logging: "error"
			},
			open: true
		},
		module: require("./webpack.loaders.js"),
		plugins: [
			new CleanWebpackPlugin(),
			new HtmlWebpackPlugin({
				template: "./app/index.html",
				favicon: "./app/assets/icon.ico"
			}),
			new DefinePlugin({
				"process.env.DEV": JSON.stringify(env.DEV)
			}),
			new NodePolyfillPlugin()
		],
		devtool: "source-map",
		resolve: {
			extensions: [".ts", ".tsx", ".js"]
		},
		optimization: {
			minimize: true,
			minimizer: [
				new TerserPlugin({
					terserOptions: {
						keep_classnames: true,
						keep_fnames: true
					}
				})
			]
		}
	}

	if (env.DEV === "true") {
		delete config.optimization
	}

	return config
}
