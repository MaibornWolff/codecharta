import { render, screen } from "@testing-library/angular"
import { DependencyEdgeLegendComponent } from "./dependencyEdgeLegend.component"

describe("DependencyEdgeLegendComponent", () => {
    it("should explain the four edge colours", async () => {
        // Act
        await render(DependencyEdgeLegendComponent)

        // Assert
        const entries = screen.getAllByRole("listitem").map(entry => entry.textContent.trim())
        expect(entries).toHaveLength(4)
        expect(entries).toContain("Points upward and closes a cycle")
    })
})
