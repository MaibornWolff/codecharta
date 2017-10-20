module.exports = {
    options: {
        stats: !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
    },
    prod: require("./webpack.config.js"),
    dev: Object.assign({ watch: true }, require("./webpack.config.js"))
};