import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render, screen, waitFor } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { defaultMapColors } from "../../../../state/store/appSettings/mapColors/mapColors.reducer"
import { mapColorsSelector } from "../../../../state/store/appSettings/mapColors/mapColors.selector"
import { inspectorMetricRowsSelector, MetricRow } from "../../selectors/inspectorMetricRows.selector"
import { InspectorMetricsListComponent } from "./inspectorMetricsList.component"

const metricRows: MetricRow[] = [
    { name: "coverage", value: 62, fraction: 0.62, severity: "warning" },
    { name: "rloc", value: 842, fraction: 0.8, severity: "error" }
]
const metricRowsWithEmpty: MetricRow[] = [
    ...metricRows,
    { name: "bugs", value: 0, fraction: 0, severity: "neutral" },
    { name: "vulnerabilities", value: 0, fraction: 0, severity: "neutral" }
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

    it("should not show the empty metrics toggle when every metric has a value", async () => {
        // Arrange
        const { detectChanges } = await render(InspectorMetricsListComponent)
        const mockStore = TestBed.inject(MockStore)
        mockStore.overrideSelector(inspectorMetricRowsSelector, metricRows)
        mockStore.refreshState()

        // Act
        detectChanges()

        // Assert
        expect(screen.queryByTestId("inspector-empty-metrics-toggle")).toBe(null)
    })

    it("should group empty metrics in a collapsed section below the metrics with values", async () => {
        // Arrange
        const { container, detectChanges } = await render(InspectorMetricsListComponent)
        const mockStore = TestBed.inject(MockStore)
        mockStore.overrideSelector(inspectorMetricRowsSelector, metricRowsWithEmpty)
        mockStore.refreshState()

        // Act
        detectChanges()

        // Assert
        expect(container.querySelectorAll("cc-inspector-metric-row").length).toBe(2)
        expect(screen.getByTestId("inspector-empty-metrics-toggle").textContent).toContain("Empty metrics (2)")
        expect(screen.queryByTestId("inspector-empty-metrics")).toBe(null)
    })

    it("should reveal the empty metrics when expanding the collapsible", async () => {
        // Arrange
        const { container, detectChanges } = await render(InspectorMetricsListComponent)
        const mockStore = TestBed.inject(MockStore)
        mockStore.overrideSelector(inspectorMetricRowsSelector, metricRowsWithEmpty)
        mockStore.refreshState()
        detectChanges()

        // Act
        await userEvent.click(screen.getByTestId("inspector-empty-metrics-toggle"))

        // Assert
        await waitFor(() => expect(screen.queryByTestId("inspector-empty-metrics")).not.toBe(null))
        expect(container.querySelectorAll("cc-inspector-metric-row").length).toBe(4)
        expect(screen.getByText("bugs")).not.toBe(null)
    })
})
