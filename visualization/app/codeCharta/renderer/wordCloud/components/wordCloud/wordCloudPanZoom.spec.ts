import type { ECharts } from "echarts/core"
import { WordCloudPanZoom } from "./wordCloudPanZoom"

type ZrenderHandler = (event?: unknown) => void

describe("WordCloudPanZoom", () => {
    const CONTAINER_WIDTH = 800
    const CONTAINER_HEIGHT = 600
    const WHOLE_CLOUD_TRANSFORM = { x: 0, y: 0, scaleX: 1, scaleY: 1 }

    let handlers: Map<string, ZrenderHandler>
    let wordGroup: { attr: jest.Mock }
    let seriesModel: object | undefined
    let panZoom: WordCloudPanZoom

    function fire(eventName: string, event?: unknown) {
        handlers.get(eventName)?.(event)
    }

    function zoomInAt(offsetX: number, offsetY: number) {
        fire("mousewheel", { offsetX, offsetY, wheelDelta: 1, event: { preventDefault: jest.fn() } })
    }

    beforeEach(() => {
        handlers = new Map()
        wordGroup = { attr: jest.fn() }
        seriesModel = {}
        const chart = {
            getZr: () => ({ on: (eventName: string, handler: ZrenderHandler) => handlers.set(eventName, handler) }),
            getModel: () => ({ getSeriesByIndex: () => seriesModel }),
            getViewOfSeriesModel: () => ({ group: wordGroup }),
            getWidth: () => CONTAINER_WIDTH,
            getHeight: () => CONTAINER_HEIGHT
        }
        panZoom = new WordCloudPanZoom(chart as unknown as ECharts)
    })

    it("should magnify the cloud around the pointer when the wheel zooms in", () => {
        // Arrange & Act
        zoomInAt(400, 300)

        // Assert
        const transform = wordGroup.attr.mock.calls.at(-1)[0]
        expect(transform.scaleX).toBeCloseTo(1.2)
        expect(transform.scaleY).toBeCloseTo(1.2)
        expect(transform.x).toBeCloseTo(-80)
        expect(transform.y).toBeCloseTo(-60)
    })

    it("should keep the page from scrolling while the wheel zooms the cloud", () => {
        // Arrange
        const preventDefault = jest.fn()

        // Act
        fire("mousewheel", { offsetX: 0, offsetY: 0, wheelDelta: 1, event: { preventDefault } })

        // Assert
        expect(preventDefault).toHaveBeenCalledTimes(1)
    })

    it("should stay on the whole cloud when the wheel zooms out of it", () => {
        // Arrange & Act
        fire("mousewheel", { offsetX: 400, offsetY: 300, wheelDelta: -1 })

        // Assert
        expect(wordGroup.attr).toHaveBeenLastCalledWith(WHOLE_CLOUD_TRANSFORM)
    })

    it("should ignore a wheel event that did not turn", () => {
        // Arrange & Act
        fire("mousewheel", { offsetX: 400, offsetY: 300, wheelDelta: 0 })

        // Assert
        expect(wordGroup.attr).not.toHaveBeenCalled()
    })

    it("should pan a magnified cloud by the distance it is dragged", () => {
        // Arrange
        zoomInAt(400, 300)

        // Act
        fire("mousedown", { offsetX: 100, offsetY: 100, event: { button: 0 } })
        fire("mousemove", { offsetX: 90, offsetY: 105 })

        // Assert
        const transform = wordGroup.attr.mock.calls.at(-1)[0]
        expect(transform.x).toBeCloseTo(-90)
        expect(transform.y).toBeCloseTo(-55)
    })

    it("should not pan once the button is released", () => {
        // Arrange
        zoomInAt(400, 300)
        fire("mousedown", { offsetX: 100, offsetY: 100, event: { button: 0 } })
        fire("mouseup")
        wordGroup.attr.mockClear()

        // Act
        fire("mousemove", { offsetX: 90, offsetY: 105 })

        // Assert
        expect(wordGroup.attr).not.toHaveBeenCalled()
    })

    it("should not pan once the pointer left the cloud", () => {
        // Arrange
        zoomInAt(400, 300)
        fire("mousedown", { offsetX: 100, offsetY: 100 })
        fire("globalout")
        wordGroup.attr.mockClear()

        // Act
        fire("mousemove", { offsetX: 90, offsetY: 105 })

        // Assert
        expect(wordGroup.attr).not.toHaveBeenCalled()
    })

    it("should leave the cloud alone when another button than the primary one drags", () => {
        // Arrange
        zoomInAt(400, 300)
        wordGroup.attr.mockClear()

        // Act
        fire("mousedown", { offsetX: 100, offsetY: 100, event: { button: 2 } })
        fire("mousemove", { offsetX: 90, offsetY: 105 })

        // Assert
        expect(wordGroup.attr).not.toHaveBeenCalled()
    })

    it("should put the whole cloud back on request", () => {
        // Arrange
        zoomInAt(400, 300)

        // Act
        panZoom.showWholeCloud()

        // Assert
        expect(wordGroup.attr).toHaveBeenLastCalledWith(WHOLE_CLOUD_TRANSFORM)
    })

    it("should magnify a newly laid out cloud the way the last one was", () => {
        // Arrange
        zoomInAt(400, 300)
        const magnified = wordGroup.attr.mock.calls.at(-1)[0]
        wordGroup = { attr: jest.fn() }

        // Act
        panZoom.restoreAfterLayout()

        // Assert
        expect(wordGroup.attr).toHaveBeenCalledWith(magnified)
    })

    it("should leave a newly laid out cloud untouched while the whole cloud is shown", () => {
        // Arrange & Act
        panZoom.restoreAfterLayout()

        // Assert
        expect(wordGroup.attr).not.toHaveBeenCalled()
    })

    it("should remember the magnification while no cloud is drawn yet", () => {
        // Arrange
        seriesModel = undefined
        zoomInAt(400, 300)
        seriesModel = {}

        // Act
        panZoom.restoreAfterLayout()

        // Assert
        expect(wordGroup.attr.mock.calls.at(-1)[0].scaleX).toBeCloseTo(1.2)
    })
})
