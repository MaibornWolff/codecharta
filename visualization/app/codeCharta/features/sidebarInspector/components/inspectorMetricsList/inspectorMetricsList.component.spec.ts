import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render, screen, waitFor } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { defaultMapColors } from "../../../../state/store/appSettings/mapColors/mapColors.reducer"
import { mapColorsSelector } from "../../../../state/store/appSettings/mapColors/mapColors.selector"
import { inspectorMetricRowsSelector, MetricRow } from "../../selectors/inspectorMetricRows.selector"
import { InspectorMetricsListComponent } from "./inspectorMetricsList.component"

const metricRows: MetricRow[] = [
    { name: "coverage", value: 62, mapBar: { fraction: 0.62, severity: "warning" }, rangeBar: { fraction: 0.3, severity: "success" } },
    { name: "rloc", value: 842, mapBar: { fraction: 0.8, severity: "error" }, rangeBar: { fraction: 0.4, severity: "warning" } }
]
const metricRowsWithEmpty: MetricRow[] = [
    ...metricRows,
    { name: "bugs", value: 0, mapBar: { fraction: 0, severity: "neutral" }, rangeBar: { fraction: 0, severity: "neutral" } },
    { name: "vulnerabilities", value: 0, mapBar: { fraction: 0, severity: "neutral" }, rangeBar: { fraction: 0, severity: "neutral" } }
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

    function showRows(rows: MetricRow[], detectChanges: () => void) {
        const mockStore = TestBed.inject(MockStore)
        mockStore.overrideSelector(inspectorMetricRowsSelector, rows)
        mockStore.refreshState()
        detectChanges()
    }

    it("should show an empty state when the node has no metrics", async () => {
        // Arrange & Act
        await render(InspectorMetricsListComponent)

        // Assert
        expect(screen.getByTestId("inspector-metrics-empty").textContent).toContain("No metrics available")
        expect(screen.queryByTestId("inspector-comparison-toggle")).toBe(null)
    })

    it("should render one row per metric", async () => {
        // Arrange
        const { container, detectChanges } = await render(InspectorMetricsListComponent)

        // Act
        showRows(metricRows, detectChanges)

        // Assert
        expect(container.querySelectorAll("cc-inspector-metric-row").length).toBe(2)
        expect(screen.queryByTestId("inspector-metrics-empty")).toBe(null)
        expect(screen.getByText("coverage")).not.toBe(null)
        expect(screen.getByText("842")).not.toBe(null)
    })

    it("should compare against the whole map by default and switch to the min/max range on toggle", async () => {
        // Arrange
        const { container, detectChanges } = await render(InspectorMetricsListComponent)
        showRows(metricRows, detectChanges)
        const firstBar = container.querySelector("[data-testid='metric-row-bar']") as HTMLElement
        expect(firstBar.style.width).toBe("62%")
        expect(screen.getByTestId("inspector-comparison-map").className).toContain("btn-active")

        // Act
        await userEvent.click(screen.getByTestId("inspector-comparison-range"))

        // Assert
        await waitFor(() => expect(firstBar.style.width).toBe("30%"))
        expect(screen.getByTestId("inspector-comparison-range").className).toContain("btn-active")
    })

    it("should not show the empty metrics toggle when every metric has a value", async () => {
        // Arrange
        const { detectChanges } = await render(InspectorMetricsListComponent)

        // Act
        showRows(metricRows, detectChanges)

        // Assert
        expect(screen.queryByTestId("inspector-empty-metrics-toggle")).toBe(null)
    })

    it("should group empty metrics in a collapsed section below the metrics with values", async () => {
        // Arrange
        const { container, detectChanges } = await render(InspectorMetricsListComponent)

        // Act
        showRows(metricRowsWithEmpty, detectChanges)

        // Assert
        expect(container.querySelectorAll("cc-inspector-metric-row").length).toBe(2)
        expect(screen.getByTestId("inspector-empty-metrics-toggle").textContent).toContain("Empty metrics (2)")
        expect(screen.queryByTestId("inspector-empty-metrics")).toBe(null)
    })

    it("should reveal the empty metrics when expanding the collapsible", async () => {
        // Arrange
        const { container, detectChanges } = await render(InspectorMetricsListComponent)
        showRows(metricRowsWithEmpty, detectChanges)

        // Act
        await userEvent.click(screen.getByTestId("inspector-empty-metrics-toggle"))

        // Assert
        await waitFor(() => expect(screen.queryByTestId("inspector-empty-metrics")).not.toBe(null))
        expect(container.querySelectorAll("cc-inspector-metric-row").length).toBe(4)
        expect(screen.getByText("bugs")).not.toBe(null)
    })
})
