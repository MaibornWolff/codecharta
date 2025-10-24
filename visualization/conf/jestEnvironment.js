const JSDOMEnvironment = require("jest-environment-jsdom").TestEnvironment

class CustomJSDOMEnvironment extends JSDOMEnvironment {
    constructor(...args) {
        super(...args)

        // Expose Node.js structuredClone to jsdom global
        this.global.structuredClone = structuredClone
    }
}

module.exports = CustomJSDOMEnvironment
