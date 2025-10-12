import { setupZoneTestEnv } from "jest-preset-angular/setup-env/zone"

setupZoneTestEnv()

const numberToLocaleString = Number.prototype.toLocaleString
Number.prototype.toLocaleString = function (locale = "en-US") {
    return numberToLocaleString.call(this, locale)
}

const CONSOLE_FAIL_TYPES = ["warn", "error"]

// Throw errors when a `console.error` or `console.warn` happens
// by overriding the functions
CONSOLE_FAIL_TYPES.forEach(type => {
    console[type] = message => {
        throw new Error(`Failing due to console.${type} while running test!\n\n${message}`)
    }
})

window["__TEST_ENVIRONMENT__"] = true
