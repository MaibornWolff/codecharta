module.exports = {
    rules: [
        {
            test: /\.ts$/,
            enforce: 'pre',
            loader: 'tslint-loader',
            options: require("./tslint.loader.config")
        },
        {
            test: /\.js$/,
            exclude: /node_modules/,
            loaders: [ 'ng-annotate-loader', 'babel-loader']
        },
        {
            test: /\.html$/,
            loaders: [ 'html-loader' ]
        },
        {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        },
        {
            test: /\.scss$/,
            use: ['style-loader', 'css-loader', 'sass-loader?sourceMap']
        },
        {
            test: /\.(png|svg|jpg|gif)$/, use: ['file-loader']
        },
        {
            test: /\.(json)$/, use: ['json-loader']
        },
        {
            test: /\.(woff|woff2|eot|ttf|otf)$/,
            use: ['file-loader']
        },
        {
            test: /\.(ico)$/,
            use: ['file-loader?name=[name].[ext]']
        },
        {
            test: /\.ts(x?)$/,
            use: ['babel-loader', 'ts-loader?configFile=tsconfig.json'],

        },
        {
            test: /\.glsl$/,
            loaders: ['webpack-glsl-loader']
        }
    ]
};