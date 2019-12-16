module.exports = {
	rules: [
		{
			test: /\.js$/,
			exclude: /node_modules/,
			loaders: ["ng-annotate-loader", "babel-loader"]
		},
		{
			test: /\.html$/,
			loaders: ["html-loader"]
		},
		{
			test: /\.css$/,
			use: ["style-loader", "css-loader"]
		},
		{
			test: /\.scss$/,
			use: ["style-loader", "css-loader", "sass-loader?sourceMap"]
		},
		{
			test: /\.(png|svg|jpg|gif)$/,
			use: ["file-loader"]
		},
		{
			test: /\.(woff|woff2|eot|ttf|otf)$/,
			use: ["file-loader"]
		},
		{
			test: /\.(ico)$/,
			use: ["file-loader?name=[name].[ext]"]
		},
		{
			test: /\.ts(x?)$/,
			use: ["ng-annotate-loader", "babel-loader", "ts-loader?configFile=tsconfig.webpack.json"]
		},
		{
			test: /\.glsl$/,
			loaders: ["webpack-glsl-loader"]
		}
	]
}
