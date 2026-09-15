const JSDOMEnvironment = require("jest-environment-jsdom").TestEnvironment

class CustomJSDOMEnvironment extends JSDOMEnvironment {
    constructor(...args) {
        super(...args)

        // Expose Node.js structuredClone to jsdom global
        this.global.structuredClone = structuredClone

        // jsdom's crypto has no subtle, so expose Node.js Web Crypto digests
        Object.defineProperty(this.global.crypto, "subtle", { value: globalThis.crypto.subtle, writable: true, configurable: true })
    }
}

module.exports = CustomJSDOMEnvironment
