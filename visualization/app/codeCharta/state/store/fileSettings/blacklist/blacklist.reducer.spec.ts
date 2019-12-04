import { addBlacklistItem, BlacklistAction, setBlacklist, removeBlacklistItem } from "./blacklist.actions"
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
