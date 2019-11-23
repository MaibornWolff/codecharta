import { addBlacklistItem, BlacklistAction, loadBlacklist, removeBlacklistItem } from "./blacklist.actions"
import { blacklist } from "./blacklist.reducer"
import { BlacklistItem, BlacklistType } from "../../../../codeCharta.model"

describe("blacklist", () => {
	const item: BlacklistItem = { type: BlacklistType.flatten, path: "foo/bar" }

	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = blacklist(undefined, {} as BlacklistAction)

			expect(result).toEqual([])
		})
	})

	describe("Action: ADD_BLACKLIST_ITEM", () => {
		it("should add a blacklist item to the blacklist", () => {
			const result = blacklist([], addBlacklistItem(item))

			expect(result).toEqual([item])
		})
	})

	describe("Action: REMOVE_BLACKLIST_ITEM", () => {
		it("should remove a blacklist item, that is in the list", () => {
			const result = blacklist([item], removeBlacklistItem(item))

			expect(result).toEqual([])
		})
	})

	describe("Action: LOAD_BLACKLIST", () => {
		it("should update the blacklist with a new one", () => {
			const result = blacklist([], loadBlacklist([item, item]))

			expect(result).toEqual([item, item])
		})
	})
})
