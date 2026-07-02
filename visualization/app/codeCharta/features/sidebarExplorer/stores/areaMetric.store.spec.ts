import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { ExplorerAreaMetricStore } from "./areaMetric.store"
import { areaMetricSelector } from "../../../mapState/mapState.facade"

describe("ExplorerAreaMetricStore", () => {
    let store: ExplorerAreaMetricStore
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ExplorerAreaMetricStore, provideMockStore({ selectors: [{ selector: areaMetricSelector, value: "unary" }] })]
        })

        store = TestBed.inject(ExplorerAreaMetricStore)
        mockStore = TestBed.inject(MockStore)
    })

    describe("areaMetric$", () => {
        it("should emit value from selector", done => {
            // Arrange
            mockStore.overrideSelector(areaMetricSelector, "rloc")
            mockStore.refreshState()

            // Act & Assert
            store.areaMetric$.subscribe(value => {
                expect(value).toBe("rloc")
                done()
            })
        })
    })
})
