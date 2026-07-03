import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { SortingOrderAscendingStore } from "./sortingOrderAscending.store"
import { sortingOrderAscendingSelector } from "../../../preferences/preferences.read.facade"
import { toggleSortingOrderAscending } from "../../../preferences/preferences.write.facade"
import { getLastAction } from "../../../util/testUtils/store.utils"

describe("SortingOrderAscendingStore", () => {
    let store: SortingOrderAscendingStore
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                SortingOrderAscendingStore,
                provideMockStore({ selectors: [{ selector: sortingOrderAscendingSelector, value: true }] })
            ]
        })

        store = TestBed.inject(SortingOrderAscendingStore)
        mockStore = TestBed.inject(MockStore)
    })

    describe("sortingOrderAscending$", () => {
        it("should emit value from selector", done => {
            // Arrange
            mockStore.overrideSelector(sortingOrderAscendingSelector, false)
            mockStore.refreshState()

            // Act & Assert
            store.sortingOrderAscending$.subscribe(value => {
                expect(value).toBe(false)
                done()
            })
        })
    })

    describe("toggle", () => {
        it("should dispatch toggleSortingOrderAscending action", async () => {
            // Arrange & Act
            store.toggle()

            // Assert
            expect(await getLastAction(mockStore)).toEqual(toggleSortingOrderAscending())
        })
    })
})
