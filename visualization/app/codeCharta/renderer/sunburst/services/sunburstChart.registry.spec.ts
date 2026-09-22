import { SunburstChartHandle, SunburstChartRegistry } from "./sunburstChart.registry"

describe("SunburstChartRegistry", () => {
    const chart = { getRenderedCanvas: jest.fn() } as SunburstChartHandle
    const replacedChart = { getRenderedCanvas: jest.fn() } as SunburstChartHandle

    it("should keep the current chart when a chart it already replaced unregisters", () => {
        // Arrange
        const registry = new SunburstChartRegistry()
        registry.register(replacedChart)
        registry.register(chart)

        // Act
        registry.unregister(replacedChart)

        // Assert
        expect(registry.current()).toBe(chart)
        expect(registry.hasChart()).toBe(true)
    })
})
