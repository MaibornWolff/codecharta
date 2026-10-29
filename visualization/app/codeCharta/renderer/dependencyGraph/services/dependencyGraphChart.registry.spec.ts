import { BoxShots, DependencyGraphChartRegistry } from "./dependencyGraphChart.registry"

describe("DependencyGraphChartRegistry", () => {
    const boxRect = { x: 1, y: 2, width: 3, height: 4 }
    const canvas = document.createElement("canvas")
    const boxShotsOfAGraph = (): BoxShots => ({ pixelRectOf: () => boxRect, renderWithEdgesWithin: () => canvas })

    it("should have no box to shoot while no graph provides them", () => {
        // Arrange
        const registry = new DependencyGraphChartRegistry()

        // Act
        const { pixelRectOf, renderWithEdgesWithin } = registry.boxShots

        // Assert
        expect(pixelRectOf("/root/src")).toBeNull()
        expect(renderWithEdgesWithin("/root/src", 2)).toBeNull()
    })

    it("should shoot boxes with the graph that provided them last, until that graph withdraws", () => {
        // Arrange
        const registry = new DependencyGraphChartRegistry()
        const boxShots = boxShotsOfAGraph()
        registry.provideBoxShots(boxShots)

        // Act
        const whileProvided = registry.boxShots
        registry.withdrawBoxShots(boxShots)

        // Assert
        expect(whileProvided).toBe(boxShots)
        expect(registry.boxShots.pixelRectOf("/root/src")).toBeNull()
    })

    it("should keep a newer graph's box shots when an older graph withdraws", () => {
        // Arrange
        const registry = new DependencyGraphChartRegistry()
        const olderBoxShots = boxShotsOfAGraph()
        const newerBoxShots = boxShotsOfAGraph()
        registry.provideBoxShots(olderBoxShots)
        registry.provideBoxShots(newerBoxShots)

        // Act
        registry.withdrawBoxShots(olderBoxShots)

        // Assert
        expect(registry.boxShots).toBe(newerBoxShots)
    })
})
