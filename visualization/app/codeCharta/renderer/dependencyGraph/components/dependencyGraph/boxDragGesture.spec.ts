import type { ECharts } from "echarts/core"
import { BoxDragGesture, BoxDragHandlers, DRAG_THRESHOLD_PX } from "./boxDragGesture"

const chart = { convertFromPixel: (_finder: unknown, [x, y]: number[]) => [x / 2, y / 2] } as unknown as ECharts
const SECONDARY_BUTTON = 2

function pointer(offsetX: number, offsetY: number, button = 0) {
    return { offsetX, offsetY, event: { button } as MouseEvent } as {
        offsetX: number
        offsetY: number
        event: MouseEvent
        __ecRoamConsumed?: boolean
    }
}

describe("BoxDragGesture", () => {
    let handlers: BoxDragHandlers
    let gesture: BoxDragGesture

    beforeEach(() => {
        jest.useFakeTimers()
        handlers = { canDragBox: jest.fn(() => true), onBoxDragged: jest.fn(), onBoxDragEnded: jest.fn() }
        gesture = new BoxDragGesture(chart, handlers)
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it("should keep the graph from panning and drag the pressed box by the pointer, in layout units, once per frame", () => {
        // Arrange
        const firstMove = pointer(20, 10)

        // Act
        gesture.press("/root/a.ts", pointer(10, 10))
        gesture.move(firstMove)
        gesture.move(pointer(30, 14))
        jest.runOnlyPendingTimers()

        // Assert
        expect(firstMove.__ecRoamConsumed).toBe(true)
        expect(handlers.canDragBox).toHaveBeenCalledWith("/root/a.ts")
        expect(handlers.onBoxDragged).toHaveBeenCalledTimes(1)
        expect(handlers.onBoxDragged).toHaveBeenCalledWith("/root/a.ts", 10, 2)
    })

    it("should leave a press it may not drag to the graph's pan", () => {
        // Arrange
        handlers.canDragBox = jest.fn(() => false)
        const move = pointer(40, 40)

        // Act
        gesture.press("/root", pointer(10, 10))
        gesture.move(move)
        gesture.release()

        // Assert
        expect(move.__ecRoamConsumed).toBeUndefined()
        expect(handlers.onBoxDragged).not.toHaveBeenCalled()
    })

    it("should ignore any button but the primary one", () => {
        // Arrange
        const secondaryPress = pointer(10, 10, SECONDARY_BUTTON)

        // Act
        gesture.press("/root/a.ts", secondaryPress)
        gesture.move(pointer(40, 40))
        gesture.release()

        // Assert
        expect(handlers.canDragBox).not.toHaveBeenCalled()
        expect(handlers.onBoxDragged).not.toHaveBeenCalled()
    })

    it("should report what is left on release and take the click that ends a drag", () => {
        // Arrange
        gesture.press("/root/a.ts", pointer(10, 10))
        gesture.move(pointer(30, 10))

        // Act
        gesture.release()

        // Assert
        expect(handlers.onBoxDragged).toHaveBeenCalledWith("/root/a.ts", 10, 0)
        expect(handlers.onBoxDragEnded).toHaveBeenCalledTimes(1)
        expect(gesture.takeClickThatEndedDrag()).toBe(true)
        expect(gesture.takeClickThatEndedDrag()).toBe(false)
    })

    it("should forget a finished drag on the next press, as no click follows a drag over zrender's tolerance", () => {
        // Arrange
        gesture.press("/root/a.ts", pointer(10, 10))
        gesture.move(pointer(40, 30))
        gesture.release()

        // Act
        gesture.press("/root/b.ts", pointer(60, 60))
        gesture.release()

        // Assert
        expect(gesture.takeClickThatEndedDrag()).toBe(false)
    })

    it("should leave the click to a press that barely moved", () => {
        // Arrange
        gesture.press("/root/a.ts", pointer(10, 10))
        gesture.move(pointer(10 + DRAG_THRESHOLD_PX, 10))

        // Act
        gesture.release()

        // Assert
        expect(gesture.takeClickThatEndedDrag()).toBe(false)
    })

    it("should drop a drag that is cancelled midway", () => {
        // Arrange
        gesture.press("/root/a.ts", pointer(10, 10))
        gesture.move(pointer(30, 10))

        // Act
        gesture.cancel()
        jest.runOnlyPendingTimers()
        gesture.release()

        // Assert
        expect(handlers.onBoxDragged).not.toHaveBeenCalled()
    })

    it("should drag by touch, which carries no button", () => {
        // Arrange
        const touch = { offsetX: 10, offsetY: 10, event: {} as TouchEvent }

        // Act
        gesture.press("/root/a.ts", touch)

        // Assert
        expect(handlers.canDragBox).toHaveBeenCalled()
    })
})

describe("BoxDragGesture with the installed ECharts", () => {
    const CHART_WIDTH = 800
    const CHART_HEIGHT = 600
    const PRESS: [number, number] = [400, 300]
    const DRAGGED_TO: [number, number] = [500, 350]

    let realChart: ReturnType<typeof import("echarts").init>

    beforeEach(() => {
        jest.useFakeTimers()
        const echarts = jest.requireActual<typeof import("echarts")>("echarts/dist/echarts.js")
        realChart = echarts.init(document.createElement("div"), null, { width: CHART_WIDTH, height: CHART_HEIGHT })
    })

    afterEach(() => {
        realChart.dispose()
        jest.useRealTimers()
    })

    function showZoomableGraph(): void {
        realChart.setOption({
            animation: false,
            grid: { left: 0, right: 0, top: 0, bottom: 0 },
            xAxis: { type: "value", min: 0, max: 100 },
            yAxis: { type: "value", min: 0, max: 100 },
            dataZoom: [
                { type: "inside", xAxisIndex: 0, startValue: 20, endValue: 60, filterMode: "none" },
                { type: "inside", yAxisIndex: 0, filterMode: "none" }
            ],
            series: []
        })
    }

    function dragPointer(): void {
        const surface = realChart.getZr().handler
        const withoutDefaults = { preventDefault: () => {}, stopPropagation: () => {} }
        const at = ([x, y]: [number, number]) => ({ zrX: x, zrY: y, offsetX: x, offsetY: y, ...withoutDefaults })
        surface.dispatch("mousedown", { ...at(PRESS), event: { button: 0, ...withoutDefaults } })
        surface.dispatch("mousemove", { ...at(DRAGGED_TO), event: withoutDefaults })
        surface.dispatch("mouseup", { ...at(DRAGGED_TO), event: { button: 0, ...withoutDefaults } })
        jest.runAllTimers()
    }

    function zoomWindows(): number[][] {
        const { dataZoom } = realChart.getOption() as { dataZoom: { start: number; end: number }[] }
        return dataZoom.map(({ start, end }) => [start, end])
    }

    it("should pan the graph on a drag that moves no box", () => {
        // Arrange
        showZoomableGraph()
        const windowBeforeDrag = zoomWindows()

        // Act
        dragPointer()

        // Assert
        expect(zoomWindows()).not.toEqual(windowBeforeDrag)
    })

    it("should keep the graph from panning while a box is dragged", () => {
        // Arrange
        const gesture = new BoxDragGesture(realChart as unknown as ECharts, {
            canDragBox: () => true,
            onBoxDragged: jest.fn(),
            onBoxDragEnded: jest.fn()
        })
        realChart.getZr().on("mousemove", event => gesture.move(event))
        showZoomableGraph()
        const windowBeforeDrag = zoomWindows()
        gesture.press("/root/a.ts", { offsetX: PRESS[0], offsetY: PRESS[1] })

        // Act
        dragPointer()

        // Assert
        expect(zoomWindows()).toEqual(windowBeforeDrag)
    })
})
