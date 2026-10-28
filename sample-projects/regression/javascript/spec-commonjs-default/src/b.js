const Service = require('./svc')

function make() {
  return new Service()
}

module.exports = { make }
