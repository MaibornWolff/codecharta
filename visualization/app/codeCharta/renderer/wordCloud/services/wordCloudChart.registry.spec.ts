import { WordCloudChartHandle, WordCloudChartRegistry } from "./wordCloudChart.registry"

function chartHandle(): WordCloudChartHandle {
    return { getRenderedCanvas: () => document.createElement("canvas") }
}

describe("WordCloudChartRegistry", () => {
    let registry: WordCloudChartRegistry

    beforeEach(() => {
        registry = new WordCloudChartRegistry()
    })

    it("should hold no chart initially", () => {
        // Assert
        expect(registry.hasChart()).toBe(false)
        expect(registry.current()).toBeNull()
    })

    it("should publish a registered chart", () => {
        // Arrange
        const chart = chartHandle()

        // Act
        registry.register(chart)

        // Assert
        expect(registry.hasChart()).toBe(true)
        expect(registry.current()).toBe(chart)
    })

    it("should drop the chart when it unregisters itself", () => {
        // Arrange
        const chart = chartHandle()
        registry.register(chart)

        // Act
        registry.unregister(chart)

        // Assert
        expect(registry.hasChart()).toBe(false)
    })

    it("should keep the current chart when a replaced chart unregisters late", () => {
        // Arrange
        const previousChart = chartHandle()
        const currentChart = chartHandle()
        registry.register(previousChart)
        registry.register(currentChart)

        // Act
        registry.unregister(previousChart)

        // Assert
        expect(registry.current()).toBe(currentChart)
    })
})
