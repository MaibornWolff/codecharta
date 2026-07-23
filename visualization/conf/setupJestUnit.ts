import { setupZonelessTestEnv } from "jest-preset-angular/setup-env/zoneless"

setupZonelessTestEnv()

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

// JSDOM (nwsapi) does not implement the native Popover API or the :popover-open selector.
// Without zone.js swallowing the thrown error, components calling popover.matches(":popover-open")
// would fail tests. Make the selector match nothing and stub the popover methods.
const originalElementMatches = Element.prototype.matches
Element.prototype.matches = function (selectors: string): boolean {
    if (selectors === ":popover-open") {
        return false
    }
    return originalElementMatches.call(this, selectors)
}
if (typeof HTMLElement.prototype.showPopover === "undefined") {
    HTMLElement.prototype.showPopover = function () {}
}
if (typeof HTMLElement.prototype.hidePopover === "undefined") {
    HTMLElement.prototype.hidePopover = function () {}
}
if (typeof HTMLElement.prototype.togglePopover === "undefined") {
    HTMLElement.prototype.togglePopover = function () {
        return false
    }
}

// JSDOM applies the UA rule `dialog:not([open]) { display: none }` but loads none of the app's
// stylesheets, so a popover built on <dialog> would hide its content from accessible queries.
// In the browser the app's own display declaration wins over that UA rule, so mirror it here.
const dialogPopoverStyle = document.createElement("style")
dialogPopoverStyle.textContent = "dialog[popover] { display: flex }"
document.head.append(dialogPopoverStyle)
