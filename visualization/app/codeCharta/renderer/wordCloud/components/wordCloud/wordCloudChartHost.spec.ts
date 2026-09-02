import * as echarts from "echarts/core"
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

jest.mock("echarts/core", () => ({
    init: jest.fn(() => mockChart),
    use: jest.fn()
}))
jest.mock("echarts/renderers", () => ({ CanvasRenderer: {} }))
jest.mock("echarts/components", () => ({ TooltipComponent: {}, AriaComponent: {} }))
jest.mock("echarts-wordcloud", () => ({}))

class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
}

describe("WordCloudChartHost", () => {
    let host: WordCloudChartHost
    const onWordRightClicked = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver
        host = new WordCloudChartHost(new WordCloudChartRegistry(), {
            onLayoutFinished: () => undefined,
            onWordRightClicked: onWordRightClicked
        })
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

    it("should report the right-clicked word at the pointer, so a menu can open there", () => {
        // Arrange
        host.attachTo(document.createElement("div"))
        const [, handleContextMenu] = mockChart.on.mock.calls.find(([eventName]) => eventName === "contextmenu")

        // Act
        handleContextMenu({ name: "invoice", event: { event: { clientX: 40, clientY: 80 } } })

        // Assert
        expect(onWordRightClicked).toHaveBeenCalledWith("invoice", 40, 80)
    })

    it("should ignore a right click that did not land on a word", () => {
        // Arrange
        host.attachTo(document.createElement("div"))
        const [, handleContextMenu] = mockChart.on.mock.calls.find(([eventName]) => eventName === "contextmenu")

        // Act
        handleContextMenu({ event: { event: { clientX: 40, clientY: 80 } } })

        // Assert
        expect(onWordRightClicked).not.toHaveBeenCalled()
    })

    it("should suppress the browser menu on the canvas, so only the word menu opens", () => {
        // Arrange
        const container = document.createElement("div")
        host.attachTo(container)
        const browserMenuEvent = new MouseEvent("contextmenu", { cancelable: true })

        // Act
        container.dispatchEvent(browserMenuEvent)

        // Assert
        expect(browserMenuEvent.defaultPrevented).toBe(true)
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
