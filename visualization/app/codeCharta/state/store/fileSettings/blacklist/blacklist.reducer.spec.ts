import { addBlacklistItem, setBlacklist, removeBlacklistItem, addBlacklistItems } from "./blacklist.actions"
import { blacklist } from "./blacklist.reducer"
import { BlacklistItem } from "../../../../codeCharta.model"

describe("blacklist", () => {
    const item: BlacklistItem = { type: "flatten", path: "foo/bar" }

    describe("Action: ADD_BLACKLIST_ITEM", () => {
        it("should add a blacklist item to the blacklist", () => {
            const result = blacklist([], addBlacklistItem({ item }))

            expect(result).toEqual([item])
        })
    })

    describe("Action: ADD_BLACKLIST_ITEMS", () => {
        it("should add all unique blacklist items to the blacklist", () => {
            const existingItem: BlacklistItem = { type: "flatten", path: "foo/bar" }
            const result = blacklist(
                [existingItem],
                addBlacklistItems({ items: [existingItem, { type: "flatten", path: "foo/bar2" }, { type: "flatten", path: "foo/bar2" }] })
            )

            expect(result).toEqual([existingItem, { type: "flatten", path: "foo/bar2" }])
        })
    })

    describe("Action: REMOVE_BLACKLIST_ITEM", () => {
        it("should remove a blacklist item, that is in the list", () => {
            const result = blacklist([item], removeBlacklistItem({ item }))

            expect(result).toEqual([])
        })
    })

    describe("Action: SET_BLACKLIST", () => {
        it("should set new blacklist", () => {
            const result = blacklist([], setBlacklist({ value: [item, item] }))

            expect(result).toEqual([item, item])
        })
    })
})
