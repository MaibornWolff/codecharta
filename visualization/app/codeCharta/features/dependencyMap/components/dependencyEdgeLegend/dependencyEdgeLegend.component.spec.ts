import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { edgeMetricSelector } from "../../../../stores/mapState/mapState.read.facade"
import { DependencyEdgeLegendComponent } from "./dependencyEdgeLegend.component"

async function renderFor(edgeMetric: string) {
    await render(DependencyEdgeLegendComponent, {
        providers: [provideMockStore({ selectors: [{ selector: edgeMetricSelector, value: edgeMetric }] })]
    })
    return screen.getAllByRole("listitem").map(entry => entry.textContent.trim())
}

describe("DependencyEdgeLegendComponent", () => {
    it("should explain the four edge colours of the dependencies", async () => {
        // Arrange
        const edgeMetric = "dependencies"

        // Act
        const entries = await renderFor(edgeMetric)

        // Assert
        expect(entries).toHaveLength(4)
        expect(entries).toContain("Points upward and closes a cycle")
    })

    it("should name the only colour another edge metric is drawn in", async () => {
        // Arrange
        const edgeMetric = "temporal_coupling"

        // Act
        const entries = await renderFor(edgeMetric)

        // Assert
        expect(entries).toEqual([edgeMetric])
    })
})
