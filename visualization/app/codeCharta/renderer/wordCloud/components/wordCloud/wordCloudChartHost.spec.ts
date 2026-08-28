import * as echarts from "echarts"
import { WordCloudChartRegistry } from "../../services/wordCloudChart.registry"
import { WordCloudChartHost } from "./wordCloudChartHost"

const mockChart = {
    setOption: jest.fn(),
    resize: jest.fn(),
    dispose: jest.fn(),
    clear: jest.fn(),
    on: jest.fn(),
    getModel: jest.fn()
}

jest.mock("echarts", () => ({
    init: jest.fn(() => mockChart)
}))
jest.mock("echarts-wordcloud", () => ({}))

class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
}

describe("WordCloudChartHost", () => {
    let host: WordCloudChartHost

    beforeEach(() => {
        jest.clearAllMocks()
        window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver
        host = new WordCloudChartHost(new WordCloudChartRegistry(), () => undefined)
    })

    it("should keep the chart when attaching to the same container again", () => {
        // Arrange
        const container = document.createElement("div")
        host.attachTo(container)

        // Act
        host.attachTo(container)

        // Assert
        expect(echarts.init).toHaveBeenCalledTimes(1)
    })

    it("should attach to a re-created container instead of drawing into the replaced one", () => {
        // Arrange — the empty state destroys the container element, so coming back gives a brand new one
        host.attachTo(document.createElement("div"))
        const recreatedContainer = document.createElement("div")

        // Act
        host.attachTo(recreatedContainer)

        // Assert — a chart left on the replaced element draws where nobody can see it
        expect(echarts.init).toHaveBeenCalledTimes(2)
        expect(echarts.init).toHaveBeenLastCalledWith(recreatedContainer)
    })
})
