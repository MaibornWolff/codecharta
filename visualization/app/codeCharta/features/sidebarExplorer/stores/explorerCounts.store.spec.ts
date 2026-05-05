import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { ExplorerCountsStore } from "./explorerCounts.store"
import { explorerCountsSelector } from "../selectors/sidebarExplorer.selectors"

describe("ExplorerCountsStore", () => {
    let store: ExplorerCountsStore
    let mockStore: MockStore

    const initialCounts = { shown: 0, flattened: 0, hidden: 0, noArea: 0 }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ExplorerCountsStore, provideMockStore({ selectors: [{ selector: explorerCountsSelector, value: initialCounts }] })]
        })

        store = TestBed.inject(ExplorerCountsStore)
        mockStore = TestBed.inject(MockStore)
    })

    describe("counts$", () => {
        it("should emit value from selector", done => {
            // Arrange
            const updated = { shown: 10, flattened: 2, hidden: 3, noArea: 1 }
            mockStore.overrideSelector(explorerCountsSelector, updated)
            mockStore.refreshState()

            // Act & Assert
            store.counts$.subscribe(value => {
                expect(value).toEqual(updated)
                done()
            })
        })
    })
})
