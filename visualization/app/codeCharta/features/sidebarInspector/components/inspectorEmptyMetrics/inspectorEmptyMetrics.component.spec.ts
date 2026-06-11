import { render, screen, waitFor } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { MetricRow } from "../../selectors/inspectorMetricRows.selector"
import { InspectorEmptyMetricsComponent } from "./inspectorEmptyMetrics.component"

const emptyRows: MetricRow[] = [
    { name: "bugs", value: 0, mapBar: { fraction: 0, severity: "neutral" }, rangeBar: { fraction: 0, severity: "neutral" } },
    { name: "vulnerabilities", value: 0, mapBar: { fraction: 0, severity: "neutral" }, rangeBar: { fraction: 0, severity: "neutral" } }
]

const baseInputs = { comparisonMode: "map" as const, positiveDeltaColor: "green", negativeDeltaColor: "red" }

describe("InspectorEmptyMetricsComponent", () => {
    it("should render nothing when there are no empty metrics", async () => {
        // Arrange & Act
        await render(InspectorEmptyMetricsComponent, { inputs: { rows: [], ...baseInputs } })

        // Assert
        expect(screen.queryByTestId("inspector-empty-metrics-toggle")).toBe(null)
    })

    it("should show a collapsed toggle with the number of empty metrics", async () => {
        // Arrange & Act
        await render(InspectorEmptyMetricsComponent, { inputs: { rows: emptyRows, ...baseInputs } })

        // Assert
        expect(screen.getByTestId("inspector-empty-metrics-toggle").textContent).toContain("Empty metrics (2)")
        expect(screen.queryByTestId("inspector-empty-metrics")).toBe(null)
    })

    it("should reveal the empty metrics when expanding", async () => {
        // Arrange
        const { container } = await render(InspectorEmptyMetricsComponent, { inputs: { rows: emptyRows, ...baseInputs } })

        // Act
        await userEvent.click(screen.getByTestId("inspector-empty-metrics-toggle"))

        // Assert
        await waitFor(() => expect(screen.queryByTestId("inspector-empty-metrics")).not.toBe(null))
        expect(container.querySelectorAll("cc-inspector-metric-row").length).toBe(2)
    })
})
