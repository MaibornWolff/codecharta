import { addBlacklistItem, BlacklistAction, setBlacklist, removeBlacklistItem } from "./blacklist.actions"
import { blacklist } from "./blacklist.reducer"
import { BlacklistItem, BlacklistType } from "../../../../codeCharta.model"
import { Blacklist } from "../../../../model/blacklist"

describe("blacklist", () => {
	const item: BlacklistItem = { type: BlacklistType.flatten, path: "foo/bar" }

	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = blacklist(undefined, {} as BlacklistAction)

			expect(result).toEqual(new Blacklist())
		})
	})

	describe("Action: ADD_BLACKLIST_ITEM", () => {
		it("should add a blacklist item to the blacklist", () => {
			const result = blacklist(new Blacklist(), addBlacklistItem(item))

			expect(result.has(item.path, item.type)).toBeTruthy()
		})
	})

	describe("Action: REMOVE_BLACKLIST_ITEM", () => {
		it("should remove a blacklist item, that is in the list", () => {
			const result = blacklist(new Blacklist([item]), removeBlacklistItem(item))

			expect(result.has(item.path, item.type)).toBeFalsy()
		})
	})

	describe("Action: SET_BLACKLIST", () => {
		it("should set new blacklist", () => {
			const result = blacklist(new Blacklist(), setBlacklist(new Blacklist([item, item])))

			expect(result.getItems()).toEqual([item, item])
		})

		it("should set default blacklist", () => {
			const result = blacklist(new Blacklist([item, item]), setBlacklist())

			expect(result).toEqual(new Blacklist())
		})
	})
})
