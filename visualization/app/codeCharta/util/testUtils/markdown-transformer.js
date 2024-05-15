const marked = require("marked")

module.exports = {
    process(source) {
        const html = marked.parse(source)
        return {
            module: "commonjs",
            code: `module.exports = ${JSON.stringify(html)};`
        }
    }
}
