/* eslint-disable @typescript-eslint/triple-slash-reference */

// After removing below if block, and resorting to "import" this manual type reference becomes obsolete
/// <reference path="node_modules/@types/angular-mocks/index.d.ts" />

// e2e tests must not include these - hot fix for issue #2300
if (process.env.testType !== "e2e") {
	require("angular")
	require("angular-mocks")
	require("jest-preset-angular/setup-jest")
}
