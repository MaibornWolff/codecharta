import { BlacklistType } from "../../../../codeCharta.model"
import { parseBlacklistItems } from "./parseBlacklistItems"

describe("parseBlacklistItems", () => {
	it("should parse multiple items", () => {
		expect(parseBlacklistItems(BlacklistType.flatten, "html,ts")).toEqual([
			{ type: BlacklistType.flatten, path: "*html*" },
			{ type: BlacklistType.flatten, path: "*ts*" }
		])
	})

	it("should parse multiple negated items", () => {
		expect(parseBlacklistItems(BlacklistType.flatten, "!html,ts")).toEqual([
			{ type: BlacklistType.flatten, path: "!*html*" },
			{ type: BlacklistType.flatten, path: "!*ts*" }
		])
	})
})
