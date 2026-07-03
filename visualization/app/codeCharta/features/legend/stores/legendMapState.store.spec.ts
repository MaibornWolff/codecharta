import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { areaMetricSelector, edgeMetricSelector } from "../../../mapState/mapState.facade"
import { LegendMapStateStore } from "./legendMapState.store"

describe("LegendMapStateStore", () => {
    let store: LegendMapStateStore
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                LegendMapStateStore,
                provideMockStore({
                    selectors: [
                        { selector: areaMetricSelector, value: "rloc" },
                        { selector: edgeMetricSelector, value: "" }
                    ]
                })
            ]
        })

        store = TestBed.inject(LegendMapStateStore)
        mockStore = TestBed.inject(MockStore)
    })

    it("should emit the selected edge metric from the selector", done => {
        // Arrange
        mockStore.overrideSelector(edgeMetricSelector, "pairingRate")
        mockStore.refreshState()

        // Act & Assert
        store.edgeMetric$.subscribe(value => {
            expect(value).toBe("pairingRate")
            done()
        })
    })
})
