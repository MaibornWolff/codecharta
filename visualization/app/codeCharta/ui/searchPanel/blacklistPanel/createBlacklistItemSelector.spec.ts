import { BlacklistItem } from "../../../codeCharta.model"
import { _getFilteredAndSortedItems } from "./createBlacklistItemSelector"

describe("createBlacklistItemSelector _getItems", () => {
	it("should filter by type", () => {
		const blacklist: BlacklistItem[] = [
			{ type: "exclude", path: "something.ts" },
			{ type: "flatten", path: "something-else.ts" }
		]
		expect(_getFilteredAndSortedItems("flatten", blacklist)).toEqual([blacklist[1]])
	})

	it("should sort by path", () => {
		const blacklist: BlacklistItem[] = [
			{ type: "flatten", path: "something.ts" },
			{ type: "flatten", path: "another-something.ts" },
			{ type: "flatten", path: "really/something-else.ts" }
		]
		expect(_getFilteredAndSortedItems("flatten", blacklist)).toEqual([blacklist[1], blacklist[2], blacklist[0]])
	})
})
