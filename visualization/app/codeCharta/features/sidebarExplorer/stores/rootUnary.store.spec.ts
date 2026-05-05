import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { RootUnaryStore } from "./rootUnary.store"
import { rootUnarySelector } from "../../../state/selectors/accumulatedData/rootUnary.selector"

describe("RootUnaryStore", () => {
    let store: RootUnaryStore
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [RootUnaryStore, provideMockStore({ selectors: [{ selector: rootUnarySelector, value: 0 }] })]
        })

        store = TestBed.inject(RootUnaryStore)
        mockStore = TestBed.inject(MockStore)
    })

    describe("rootUnary$", () => {
        it("should emit value from selector", done => {
            // Arrange
            mockStore.overrideSelector(rootUnarySelector, 1234)
            mockStore.refreshState()

            // Act & Assert
            store.rootUnary$.subscribe(value => {
                expect(value).toBe(1234)
                done()
            })
        })
    })
})
