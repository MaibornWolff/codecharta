import * as echarts from "echarts/core"
import { WordCloudChartRegistry } from "../../services/wordCloudChart.registry"
import { WordCloudChartHost } from "./wordCloudChartHost"

const mockChart = {
    setOption: jest.fn(),
    dispatchAction: jest.fn(),
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
    const onWordClicked = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver
        host = new WordCloudChartHost(new WordCloudChartRegistry(), {
            onLayoutFinished: () => undefined,
            onWordRightClicked: onWordRightClicked,
            onWordClicked: onWordClicked
        })
    })

    it("should report a clicked word, so the explorer can follow the cloud", () => {
        // Arrange
        host.attachTo(document.createElement("div"))
        const [, handleClick] = mockChart.on.mock.calls.find(([eventName]) => eventName === "click")

        // Act
        handleClick({ name: "invoice" })

        // Assert
        expect(onWordClicked).toHaveBeenCalledWith("invoice")
    })

    it("should ignore a click that did not land on a word", () => {
        // Arrange
        host.attachTo(document.createElement("div"))
        const [, handleClick] = mockChart.on.mock.calls.find(([eventName]) => eventName === "click")

        // Act
        handleClick({})

        // Assert
        expect(onWordClicked).not.toHaveBeenCalled()
    })

    it("should emphasise the highlighted word and drop the emphasis of everything else", () => {
        // Arrange
        host.attachTo(document.createElement("div"))

        // Act
        host.highlightWord("invoice")

        // Assert
        expect(mockChart.dispatchAction).toHaveBeenNthCalledWith(1, { type: "downplay", seriesIndex: 0 })
        expect(mockChart.dispatchAction).toHaveBeenNthCalledWith(2, { type: "highlight", seriesIndex: 0, name: "invoice" })
    })

    it("should drop every emphasis when no word is highlighted", () => {
        // Arrange
        host.attachTo(document.createElement("div"))

        // Act
        host.highlightWord(null)

        // Assert
        expect(mockChart.dispatchAction).toHaveBeenCalledTimes(1)
        expect(mockChart.dispatchAction).toHaveBeenCalledWith({ type: "downplay", seriesIndex: 0 })
    })

    it("should re-apply the highlight once a new layout has been drawn", () => {
        // Arrange: a layout wipes the emphasis, so the word the explorer expanded has to be marked again.
        host.attachTo(document.createElement("div"))
        host.highlightWord("invoice")
        mockChart.dispatchAction.mockClear()
        const [, handleFinished] = mockChart.on.mock.calls.find(([eventName]) => eventName === "finished")

        // Act
        handleFinished()

        // Assert
        expect(mockChart.dispatchAction).toHaveBeenCalledWith({ type: "highlight", seriesIndex: 0, name: "invoice" })
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
