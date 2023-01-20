import "jest-preset-angular/setup-jest"
// import "jest-preset-angular"
// import "zone.js"
// import "zone.js/testing"

// import { getTestBed } from "@angular/core/testing"
// import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from "@angular/platform-browser-dynamic/testing"

// getTestBed().initTestEnvironment(
// 	BrowserDynamicTestingModule,
// 	platformBrowserDynamicTesting()
// )

const numberToLocaleString = Number.prototype.toLocaleString
Number.prototype.toLocaleString = function (locale = "en-US") {
	return numberToLocaleString.call(this, locale)
}
