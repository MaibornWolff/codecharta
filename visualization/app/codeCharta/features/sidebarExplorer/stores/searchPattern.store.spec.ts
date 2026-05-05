import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { SearchPatternStore } from "./searchPattern.store"
import { searchPatternSelector } from "../../../state/store/dynamicSettings/searchPattern/searchPattern.selector"
import { setSearchPattern } from "../../../state/store/dynamicSettings/searchPattern/searchPattern.actions"
import { blacklistSearchPattern } from "../../../state/effects/blacklistSearchPattern/blacklistSearchPattern.effect"
import { getLastAction } from "../../../util/testUtils/store.utils"

describe("SearchPatternStore", () => {
    let store: SearchPatternStore
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SearchPatternStore, provideMockStore({ selectors: [{ selector: searchPatternSelector, value: "" }] })]
        })

        store = TestBed.inject(SearchPatternStore)
        mockStore = TestBed.inject(MockStore)
    })

    describe("searchPattern$", () => {
        it("should emit value from selector", done => {
            // Arrange
            mockStore.overrideSelector(searchPatternSelector, "needle")
            mockStore.refreshState()

            // Act & Assert
            store.searchPattern$.subscribe(value => {
                expect(value).toBe("needle")
                done()
            })
        })
    })

    describe("setSearchPattern", () => {
        it("should dispatch setSearchPattern action with value", async () => {
            // Arrange & Act
            store.setSearchPattern("needle")

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setSearchPattern({ value: "needle" }))
        })
    })

    describe("resetSearchPattern", () => {
        it("should dispatch setSearchPattern action with empty string", async () => {
            // Arrange & Act
            store.resetSearchPattern()

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setSearchPattern({ value: "" }))
        })
    })

    describe("blacklistSearchPattern", () => {
        it("should dispatch BlacklistSearchPatternAction with given type", async () => {
            // Arrange
            const dispatchSpy = jest.spyOn(mockStore, "dispatch")

            // Act
            store.blacklistSearchPattern("flatten")

            // Assert
            expect(dispatchSpy).toHaveBeenCalledWith(blacklistSearchPattern("flatten"))
        })
    })
})
