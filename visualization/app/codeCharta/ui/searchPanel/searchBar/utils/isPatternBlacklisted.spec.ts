import { BlacklistType } from "../../../../codeCharta.model"
import { isPatternBlacklisted } from "./isPatternBlacklisted"

describe("isPatternBlacklisted", () => {
	it("should recognized an exact match", () => {
		expect(isPatternBlacklisted([{ type: BlacklistType.flatten, path: "*needle*" }], BlacklistType.flatten, "*needle*")).toBe(true)
	})

	it("should recognized * matches", () => {
		expect(isPatternBlacklisted([{ type: BlacklistType.flatten, path: "*needle*" }], BlacklistType.flatten, "needle")).toBe(true)
	})

	it("should not recognized * vs absolute value", () => {
		expect(isPatternBlacklisted([{ type: BlacklistType.flatten, path: "*needle*" }], BlacklistType.flatten, "/needle")).toBe(false)
	})

	it("should ignore different blacklist type", () => {
		expect(isPatternBlacklisted([{ type: BlacklistType.flatten, path: "*needle*" }], BlacklistType.exclude, "*needle*")).toBe(false)
	})
})
