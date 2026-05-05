import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { AreaMetricStore } from "./areaMetric.store"
import { areaMetricSelector } from "../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"

describe("AreaMetricStore", () => {
    let store: AreaMetricStore
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AreaMetricStore, provideMockStore({ selectors: [{ selector: areaMetricSelector, value: "unary" }] })]
        })

        store = TestBed.inject(AreaMetricStore)
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
