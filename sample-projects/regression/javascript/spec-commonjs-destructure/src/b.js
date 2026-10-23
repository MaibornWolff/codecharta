const { Svc, helper: help } = require('./a')

function run() {
  return help() + new Svc()
}

module.exports = { run }
