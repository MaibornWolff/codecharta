const RemarkHTML = require("remark-html")

module.exports = {
	rules: [
		{
			test: /\.js$/,
			exclude: /node_modules/,
			use: ["babel-loader"]
		},
		{
			test: /\.html$/,
			use: ["html-loader"]
		},
		{
			test: /\.css$/,
			use: ["style-loader", "css-loader"]
		},
		{
			test: /\.scss$/,
			use: ["style-loader", "css-loader", "sass-loader"]
		},
		{
			test: /\.(jpe?g|svg|png|gif|ico|eot|otf|ttf|woff2?)(\?v=\d+\.\d+\.\d+)?$/i,
			type: "asset/resource"
		},
		{
			test: /\.ts(x?)$/,
			use: ["babel-loader", "ts-loader?configFile=tsconfig.webpack.json"]
		},
		{
			test: /\.glsl$/,
			use: ["webpack-glsl-loader"]
		},
		{
			test: /\.md$/,

			use: [
				{ loader: "html-loader" },
				{
					loader: "remark-loader",
					options: {
						removeFrontMatter: false,
						remarkOptions: {
							plugins: [RemarkHTML]
						}
					}
				}
			]
		}
	]
}
