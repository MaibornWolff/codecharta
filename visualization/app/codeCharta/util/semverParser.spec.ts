import { isValidSemverCore, parseSemver, compareSemver, semverObject } from "./semverParser"
describe("is valid semver core", () => {
	it("should check if the given semantic version core string is valid", () => {
		//Trues
		expect(isValidSemverCore("1.4.5")).toEqual(true)
		expect(isValidSemverCore("21.75.0")).toEqual(true)
		//Falsies
		expect(isValidSemverCore("")).toEqual(false)
		expect(isValidSemverCore("..")).toEqual(false)
		expect(isValidSemverCore("1.6.2.5.6")).toEqual(false)
	})
})
describe("parse semantic version", () => {
	it("should parse the given semantic version core string", () => {
		let semverString = "1.4.5"
		let actual: semverObject = { version: "1.4.5", major: 1, minor: 4, patch: 5 }
		expect(parseSemver(semverString)).toEqual(actual)
		semverString = "0.0.0"
		actual = { version: "0.0.0", major: 0, minor: 0, patch: 0 }
		expect(parseSemver(semverString)).toEqual(actual)
		//fail
	})
})
describe("compare semantic versions", () => {
	it("should compare the given semantic version objects", () => {
		let semver1: semverObject = { version: "2.0.0", major: 2, minor: 0, patch: 0 }
		let semver2: semverObject = { version: "1.4.5", major: 1, minor: 4, patch: 5 }
		expect(compareSemver(semver1, semver2)).toEqual(1)
		semver1 = { version: "1.4.5", major: 1, minor: 5, patch: 5 }
		semver2 = { version: "1.4.5", major: 1, minor: 4, patch: 5 }
		expect(compareSemver(semver1, semver2)).toEqual(1)
		semver1 = { version: "1.4.5", major: 1, minor: 4, patch: 8 }
		semver2 = { version: "1.4.5", major: 1, minor: 4, patch: 5 }
		expect(compareSemver(semver1, semver2)).toEqual(1)
		semver1 = { version: "1.4.5", major: 1, minor: 4, patch: 5 }
		semver2 = { version: "1.4.5", major: 1, minor: 4, patch: 5 }
		expect(compareSemver(semver1, semver2)).toEqual(0)
		semver1 = { version: "0.1.1", major: 0, minor: 4, patch: 5 }
		semver2 = { version: "1.4.5", major: 1, minor: 4, patch: 5 }
		expect(compareSemver(semver1, semver2)).toEqual(-1)
		semver1 = { version: "1.4.5", major: 1, minor: 3, patch: 5 }
		semver2 = { version: "1.4.5", major: 1, minor: 4, patch: 5 }
		expect(compareSemver(semver1, semver2)).toEqual(-1)
		semver1 = { version: "1.4.5", major: 1, minor: 4, patch: 4 }
		semver2 = { version: "1.4.5", major: 1, minor: 4, patch: 5 }
		expect(compareSemver(semver1, semver2)).toEqual(-1)
	})
})
