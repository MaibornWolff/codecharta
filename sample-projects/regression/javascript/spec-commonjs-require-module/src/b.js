const a = require('./a')

function run() {
  return a.helper() + new a.Svc()
}

module.exports = { run }
