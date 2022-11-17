import "jest-preset-angular/setup-jest"

const numberToLocaleString = Number.prototype.toLocaleString
Number.prototype.toLocaleString = function (locale = "en-US") {
	return numberToLocaleString.call(this, locale)
}
