import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { SearchedNodePathsStore } from "./searchedNodePaths.store"
import { searchedNodePathsSelector } from "../../../state/selectors/searchedNodes/searchedNodePaths.selector"

describe("SearchedNodePathsStore", () => {
    let store: SearchedNodePathsStore
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                SearchedNodePathsStore,
                provideMockStore({ selectors: [{ selector: searchedNodePathsSelector, value: new Set<string>() }] })
            ]
        })

        store = TestBed.inject(SearchedNodePathsStore)
        mockStore = TestBed.inject(MockStore)
    })

    describe("searchedNodePaths$", () => {
        it("should emit value from selector", done => {
            // Arrange
            const updated = new Set(["/root/a", "/root/b"])
            mockStore.overrideSelector(searchedNodePathsSelector, updated)
            mockStore.refreshState()

            // Act & Assert
            store.searchedNodePaths$.subscribe(value => {
                expect(value).toEqual(updated)
                done()
            })
        })
    })
})
