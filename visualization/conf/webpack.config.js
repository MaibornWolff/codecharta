module.exports = config => {
    config.module.rules.push(
        {
            test: /\.glsl$/,
            use: ["webpack-glsl-loader"]
        },
        {
            test: /\.md$/,
            type: "asset/source"
        }
    )

    return config
}
