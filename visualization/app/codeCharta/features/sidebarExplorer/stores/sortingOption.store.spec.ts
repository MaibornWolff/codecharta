import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { SortingOptionStore } from "./sortingOption.store"
import { sortingOrderSelector } from "../../../state/store/dynamicSettings/sortingOption/sortingOrder.selector"
import { setSortingOption } from "../../../state/store/dynamicSettings/sortingOption/sortingOption.actions"
import { SortingOption } from "../../../codeCharta.model"
import { getLastAction } from "../../../util/testUtils/store.utils"

describe("SortingOptionStore", () => {
    let store: SortingOptionStore
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                SortingOptionStore,
                provideMockStore({ selectors: [{ selector: sortingOrderSelector, value: SortingOption.NAME }] })
            ]
        })

        store = TestBed.inject(SortingOptionStore)
        mockStore = TestBed.inject(MockStore)
    })

    describe("sortingOption$", () => {
        it("should emit value from selector", done => {
            // Arrange
            mockStore.overrideSelector(sortingOrderSelector, SortingOption.NUMBER_OF_FILES)
            mockStore.refreshState()

            // Act & Assert
            store.sortingOption$.subscribe(value => {
                expect(value).toBe(SortingOption.NUMBER_OF_FILES)
                done()
            })
        })
    })

    describe("setSortingOption", () => {
        it("should dispatch setSortingOption action with value", async () => {
            // Arrange & Act
            store.setSortingOption(SortingOption.AREA_SIZE)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setSortingOption({ value: SortingOption.AREA_SIZE }))
        })
    })
})
