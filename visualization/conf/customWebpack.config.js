module.exports = config => {
	config.module.rules.push({
		test: /\.glsl$/,
		use: ["webpack-glsl-loader"]
	})

	// TODO NG - typescript compilation should already take care of it (also of declaration within index.d.ts)
	config.module.rules.push({
		test: /\.md$/,

		use: [
			{ loader: "html-loader" }
			// TODO NG - why remark-loader?
			// {
			// 	loader: "remark-loader",
			// 	options: {
			// 		removeFrontMatter: false,
			// 		remarkOptions: {
			// 			plugins: [RemarkHTML]
			// 		}
			// 	}
			// }
		]
	})

	return config
}
