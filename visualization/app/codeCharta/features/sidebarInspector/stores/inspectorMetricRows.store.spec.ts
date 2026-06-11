import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { inspectorMetricRowsSelector, MetricRow } from "../selectors/inspectorMetricRows.selector"
import { InspectorMetricRowsStore } from "./inspectorMetricRows.store"

describe("InspectorMetricRowsStore", () => {
    let store: InspectorMetricRowsStore
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [InspectorMetricRowsStore, provideMockStore({ selectors: [{ selector: inspectorMetricRowsSelector, value: [] }] })]
        })

        store = TestBed.inject(InspectorMetricRowsStore)
        mockStore = TestBed.inject(MockStore)
    })

    it("should emit the metric rows from the selector", done => {
        // Arrange
        const rows: MetricRow[] = [
            { name: "rloc", value: 842, mapBar: { fraction: 0.8, severity: "error" }, rangeBar: { fraction: 0.4, severity: "warning" } }
        ]
        mockStore.overrideSelector(inspectorMetricRowsSelector, rows)
        mockStore.refreshState()

        // Act & Assert
        store.metricRows$.subscribe(value => {
            expect(value).toEqual(rows)
            done()
        })
    })
})
