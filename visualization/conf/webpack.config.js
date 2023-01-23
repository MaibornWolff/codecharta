const RemarkHTML = require("remark-html")

module.exports = config => {
	config.module.rules.push(
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
	)

	return config
}
