import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { BlacklistStore } from "./blacklist.store"
import { BlacklistItem } from "../../../codeCharta.model"
import { blacklistSelector } from "../../../state/store/fileSettings/blacklist/blacklist.selector"
import { removeBlacklistItem } from "../../../state/store/fileSettings/blacklist/blacklist.actions"
import { getLastAction } from "../../../util/testUtils/store.utils"

describe("BlacklistStore", () => {
    let store: BlacklistStore
    let mockStore: MockStore

    const flattenItem: BlacklistItem = { type: "flatten", path: "**/*.spec.ts" }
    const excludeItem: BlacklistItem = { type: "exclude", path: "node_modules" }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                BlacklistStore,
                provideMockStore({
                    selectors: [{ selector: blacklistSelector, value: [flattenItem, excludeItem] }]
                })
            ]
        })

        store = TestBed.inject(BlacklistStore)
        mockStore = TestBed.inject(MockStore)
    })

    describe("removeBlacklistItem", () => {
        it("should dispatch removeBlacklistItem action with given item", async () => {
            // Arrange & Act
            store.removeBlacklistItem(flattenItem)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(removeBlacklistItem({ item: flattenItem }))
        })
    })
})
