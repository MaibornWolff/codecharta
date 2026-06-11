import { render, screen } from "@testing-library/angular"
import { MetricRow } from "../../selectors/inspectorMetricRows.selector"
import { InspectorMetricRowComponent } from "./inspectorMetricRow.component"

const baseInputs = { positiveDeltaColor: "green", negativeDeltaColor: "red" }

describe("InspectorMetricRowComponent", () => {
    it("should render the metric value with thousands separators", async () => {
        // Arrange
        const row: MetricRow = { name: "rloc", value: 4208, fraction: 1, severity: "error" }

        // Act
        await render(InspectorMetricRowComponent, { inputs: { row, ...baseInputs } })

        // Assert
        expect(screen.getByText("4,208")).not.toBe(null)
    })

    it("should size and color the bar according to the metric severity", async () => {
        // Arrange
        const row: MetricRow = { name: "rloc", value: 900, fraction: 0.9, severity: "error" }

        // Act
        await render(InspectorMetricRowComponent, { inputs: { row, ...baseInputs } })

        // Assert
        const bar = screen.getByTestId("metric-row-bar") as HTMLElement
        expect(bar.className).toContain("bg-error")
        expect(bar.style.width).toBe("90%")
    })

    it("should render a positive delta in the positive delta color", async () => {
        // Arrange
        const row: MetricRow = { name: "rloc", value: 100, delta: 12, fraction: 0.1, severity: "success" }

        // Act
        await render(InspectorMetricRowComponent, { inputs: { row, ...baseInputs } })

        // Assert
        const delta = screen.getByTestId("metric-row-delta") as HTMLElement
        expect(delta.textContent).toContain("Δ12")
        expect(delta.style.color).toBe("green")
    })

    it("should render a negative delta in the negative delta color", async () => {
        // Arrange
        const row: MetricRow = { name: "rloc", value: 100, delta: -4, fraction: 0.1, severity: "success" }

        // Act
        await render(InspectorMetricRowComponent, { inputs: { row, ...baseInputs } })

        // Assert
        const delta = screen.getByTestId("metric-row-delta") as HTMLElement
        expect(delta.textContent).toContain("Δ-4")
        expect(delta.style.color).toBe("red")
    })

    it("should hide the delta when the node has none", async () => {
        // Arrange
        const row: MetricRow = { name: "rloc", value: 100, fraction: 0.1, severity: "success" }

        // Act
        await render(InspectorMetricRowComponent, { inputs: { row, ...baseInputs } })

        // Assert
        expect(screen.queryByTestId("metric-row-delta")).toBe(null)
    })

    it("should link the metric name when the descriptor provides a link", async () => {
        // Arrange
        const row: MetricRow = {
            name: "rloc",
            value: 100,
            fraction: 0.1,
            severity: "success",
            descriptor: { title: "", description: "", hintLowValue: "", hintHighValue: "", link: "https://docs.example.com" }
        }

        // Act
        await render(InspectorMetricRowComponent, { inputs: { row, ...baseInputs } })

        // Assert
        expect(screen.getByTestId("metric-row-link").getAttribute("href")).toBe("https://docs.example.com")
    })
})
