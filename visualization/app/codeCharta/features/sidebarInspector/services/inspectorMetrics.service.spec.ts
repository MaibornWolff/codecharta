import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { defaultMapColors } from "../../../state/store/appSettings/mapColors/mapColors.reducer"
import { mapColorsSelector } from "../../../state/store/appSettings/mapColors/mapColors.selector"
import { inspectorMetricRowsSelector, MetricRow } from "../selectors/inspectorMetricRows.selector"
import { InspectorMetricsService } from "./inspectorMetrics.service"

describe("InspectorMetricsService", () => {
    let service: InspectorMetricsService
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideMockStore({
                    selectors: [
                        { selector: inspectorMetricRowsSelector, value: [] },
                        { selector: mapColorsSelector, value: defaultMapColors }
                    ]
                })
            ]
        })

        mockStore = TestBed.inject(MockStore)
        service = TestBed.inject(InspectorMetricsService)
    })

    it("should expose the metric rows", done => {
        // Arrange
        const rows: MetricRow[] = [{ name: "coverage", value: 62, fraction: 0.62, severity: "warning" }]
        mockStore.overrideSelector(inspectorMetricRowsSelector, rows)
        mockStore.refreshState()

        // Act & Assert
        service.metricRows$().subscribe(value => {
            expect(value).toEqual(rows)
            done()
        })
    })

    it("should expose the map colors", done => {
        // Arrange & Act & Assert
        service.mapColors$().subscribe(value => {
            expect(value).toEqual(defaultMapColors)
            done()
        })
    })
})
