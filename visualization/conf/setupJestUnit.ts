import { setupZoneTestEnv } from "jest-preset-angular/setup-env/zone"

setupZoneTestEnv()

const numberToLocaleString = Number.prototype.toLocaleString
Number.prototype.toLocaleString = function (locale = "en-US") {
    return numberToLocaleString.call(this, locale)
}

window["__TEST_ENVIRONMENT__"] = true

// Polyfill Request and fetch for Three.js SVGLoader in JSDOM environment
if (typeof globalThis.Request === "undefined") {
    globalThis.Request = class Request {
        url: string
        constructor(input: string) {
            this.url = input
        }
    } as any
}

if (typeof globalThis.fetch === "undefined") {
    globalThis.fetch = jest.fn(() =>
        Promise.resolve({
            ok: true,
            text: () => Promise.resolve("")
        })
    ) as any
}
