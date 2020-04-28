import { Blacklist } from "./blacklist"
import { BlacklistItem, BlacklistType } from "../codeCharta.model"

describe("Blacklist", () => {
	let blacklist: Blacklist

	const flattened: BlacklistItem = { path: "*.ts", type: BlacklistType.flatten }
	const excluded: BlacklistItem = { path: "*.html", type: BlacklistType.exclude }

	beforeEach(() => {
		blacklist = new Blacklist()
	})

	describe("constructor", () => {
		it("should create a set from an blacklist array", () => {
			const blacklist = [{ path: "/root", type: BlacklistType.exclude }]

			const actual = new Blacklist(blacklist)

			expect(actual.size()).toBe(1)
			expect(actual.getItems()).toEqual(blacklist)
		})

		it("should create an empty set if no array is given", () => {
			const actual = new Blacklist()

			expect(actual.size()).toBe(0)
			expect(actual.getItems()).toEqual([])
		})
	})

	describe("isPathExcludedOrExcluded", () => {
		it("should return true if a path matches a pattern that is excluded", () => {
			blacklist.addBlacklistItem(excluded)

			const actual = blacklist.isPathFlattenedOrExcluded("/root/file.html")

			expect(actual).toBeTruthy()
		})

		it("should return true if a path matches a pattern that is flattened", () => {
			blacklist.addBlacklistItem(flattened)

			const actual = blacklist.isPathFlattenedOrExcluded("/root/file.ts")

			expect(actual).toBeTruthy()
		})

		it("should return false if a path does not match a pattern at all", () => {
			const item: BlacklistItem = { path: "*.ts", type: BlacklistType.flatten }
			blacklist.addBlacklistItem(item)

			const actual = blacklist.isPathFlattenedOrExcluded("/root/file.html")

			expect(actual).toBeFalsy()
		})
	})

	describe("getExcludedItems", () => {
		it("should return all excluded blacklist items", () => {
			blacklist.setBlacklist([flattened, excluded])

			const actual = blacklist.getExcludedItems()

			expect(actual.length).toBe(1)
			expect(actual[0]).toEqual(excluded)
		})
	})

	describe("getFlattenedItems", () => {
		it("should return all flattened blacklist items", () => {
			const flattened: BlacklistItem = { path: "*.ts", type: BlacklistType.flatten }
			const excluded: BlacklistItem = { path: "*.html", type: BlacklistType.exclude }
			blacklist.setBlacklist([flattened, excluded])

			const actual = blacklist.getFlattenedItems()

			expect(actual.length).toBe(1)
			expect(actual[0]).toEqual(flattened)
		})
	})

	describe("sizeByType", () => {
		it("should return the number of excluded items", () => {
			blacklist.setBlacklist([flattened, excluded])

			const actual = blacklist.sizeByType(BlacklistType.exclude)

			expect(actual).toBe(1)
		})

		it("should return the number of flattened items", () => {
			blacklist.setBlacklist([flattened, excluded])

			const actual = blacklist.sizeByType(BlacklistType.flatten)

			expect(actual).toBe(1)
		})
	})

	describe("has", () => {
		it("should return true if an item exists in the blacklist", () => {
			blacklist.addBlacklistItem(flattened)

			const actual = blacklist.has("*.ts", BlacklistType.flatten)

			expect(actual).toBeTruthy()
		})

		it("should return false if an item does not exist in the blacklist", () => {
			blacklist.addBlacklistItem(flattened)

			const actual = blacklist.has("*.html", BlacklistType.flatten)

			expect(actual).toBeFalsy()
		})
	})

	describe("removeBlacklistItem", () => {
		it("should remove a found blacklist item", () => {
			blacklist.addBlacklistItem(flattened)

			blacklist.removeBlacklistItem(flattened)

			expect(blacklist.size()).toBe(0)
		})

		it("should not remove a blacklist item when nothing was found", () => {
			blacklist.addBlacklistItem(excluded)

			blacklist.removeBlacklistItem(flattened)

			expect(blacklist.size()).toBe(1)
		})
	})

	describe("append", () => {
		it("should append another blacklist to the original one", () => {
			blacklist.addBlacklistItem(flattened)

			blacklist.append(new Blacklist([excluded]))

			expect(blacklist.size()).toBe(2)
			expect(blacklist.has(flattened.path, flattened.type)).toBeTruthy()
			expect(blacklist.has(excluded.path, excluded.type)).toBeTruthy()
		})
	})
})
