const { helper, twice } = require('./a')

function run() {
  return helper() + twice()
}

module.exports = { run }
