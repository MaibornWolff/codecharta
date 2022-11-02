// e2e tests must not include these - hot fix for issue #2300
if (process.env.TEST_TYPE !== "e2e") {
	require("jest-preset-angular/setup-jest")
}

const numberToLocaleString = Number.prototype.toLocaleString
Number.prototype.toLocaleString = function (locale = "en-US") {
	return numberToLocaleString.call(this, locale)
}
