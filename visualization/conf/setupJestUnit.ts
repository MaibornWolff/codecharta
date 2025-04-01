import { setupZoneTestEnv } from "jest-preset-angular/setup-env/zone"

setupZoneTestEnv()

const numberToLocaleString = Number.prototype.toLocaleString
Number.prototype.toLocaleString = function (locale = "en-US") {
    return numberToLocaleString.call(this, locale)
}

window["__TEST_ENVIRONMENT__"] = true
