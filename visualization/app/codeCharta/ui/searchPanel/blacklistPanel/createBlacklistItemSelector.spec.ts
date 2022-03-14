import { BlacklistType } from "../../../codeCharta.model"
import { _getFilteredAndSortedItems } from "./createBlacklistItemSelector"

describe("createBlacklistItemSelector _getItems", () => {
	it("should filter by type", () => {
		const blacklist = [
			{ type: BlacklistType.exclude, path: "something.ts" },
			{ type: BlacklistType.flatten, path: "something-else.ts" }
		]
		expect(_getFilteredAndSortedItems(BlacklistType.flatten, blacklist)).toEqual([blacklist[1]])
	})

	it("should sort by path", () => {
		const blacklist = [
			{ type: BlacklistType.flatten, path: "something.ts" },
			{ type: BlacklistType.flatten, path: "another-something.ts" },
			{ type: BlacklistType.flatten, path: "really/something-else.ts" }
		]
		expect(_getFilteredAndSortedItems(BlacklistType.flatten, blacklist)).toEqual([blacklist[1], blacklist[2], blacklist[0]])
	})
})
