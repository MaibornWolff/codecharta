import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { defaultMapColors } from "../../../../state/store/appSettings/mapColors/mapColors.reducer"
import { mapColorsSelector } from "../../../../state/store/appSettings/mapColors/mapColors.selector"
import { inspectorMetricRowsSelector, MetricRow } from "../../selectors/inspectorMetricRows.selector"
import { InspectorMetricsListComponent } from "./inspectorMetricsList.component"

const metricRows: MetricRow[] = [
    { name: "coverage", value: 62, fraction: 0.62, severity: "warning" },
    { name: "rloc", value: 842, fraction: 0.8, severity: "error" }
]

describe("InspectorMetricsListComponent", () => {
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
    })

    it("should show an empty state when the node has no metrics", async () => {
        // Arrange & Act
        await render(InspectorMetricsListComponent)

        // Assert
        expect(screen.getByTestId("inspector-metrics-empty").textContent).toContain("No metrics available")
    })

    it("should render one row per metric", async () => {
        // Arrange
        const { container, detectChanges } = await render(InspectorMetricsListComponent)
        const mockStore = TestBed.inject(MockStore)
        mockStore.overrideSelector(inspectorMetricRowsSelector, metricRows)
        mockStore.refreshState()

        // Act
        detectChanges()

        // Assert
        expect(container.querySelectorAll("cc-inspector-metric-row").length).toBe(2)
        expect(screen.queryByTestId("inspector-metrics-empty")).toBe(null)
        expect(screen.getByText("coverage")).not.toBe(null)
        expect(screen.getByText("842")).not.toBe(null)
    })
})
