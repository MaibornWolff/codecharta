const path = require("path")
const fs = require("fs")

module.exports = {
	process(src, filename, config, options) {
		const formatted = src.replace(/["]/g, "'").replace(/[\r]/g, "").replace(/[\n]/g, "")
		return 'module.exports = "' + formatted + '";'
	}
}
