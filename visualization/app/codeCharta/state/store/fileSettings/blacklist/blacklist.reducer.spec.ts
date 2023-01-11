import { addBlacklistItem, BlacklistAction, setBlacklist, removeBlacklistItem, addBlacklistItems } from "./blacklist.actions"
import { blacklist } from "./blacklist.reducer"
import { BlacklistItem } from "../../../../codeCharta.model"

describe("blacklist", () => {
	const item: BlacklistItem = { type: "flatten", path: "foo/bar" }

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

	describe("Action: ADD_BLACKLIST_ITEMS", () => {
		it("should add all unique blacklist items to the blacklist", () => {
			const existingItem: BlacklistItem = { type: "flatten", path: "foo/bar" }
			const result = blacklist(
				[existingItem],
				addBlacklistItems([existingItem, { type: "flatten", path: "foo/bar2" }, { type: "flatten", path: "foo/bar2" }])
			)

			expect(result).toEqual([existingItem, { type: "flatten", path: "foo/bar2" }])
		})
	})

	describe("Action: REMOVE_BLACKLIST_ITEM", () => {
		it("should remove a blacklist item, that is in the list", () => {
			const result = blacklist([item], removeBlacklistItem(item))

			expect(result).toEqual([])
		})
	})

	describe("Action: SET_BLACKLIST", () => {
		it("should set new blacklist", () => {
			const result = blacklist([], setBlacklist([item, item]))

			expect(result).toEqual([item, item])
		})

		it("should set default blacklist", () => {
			const result = blacklist([item, item], setBlacklist())

			expect(result).toEqual([])
		})
	})
})
