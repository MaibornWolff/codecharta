import * as echarts from "echarts/core"
import {
    elementOfSize,
    fireChartEvent,
    fireRenderSurfaceEvent,
    reportResize,
    resetStubbedChart,
    stubbedChart,
    stubResizeObserver
} from "../../testing/dependencyGraph.stub"
import { AxisWindow } from "../../util/dependencyGraphOption.builder"
import { GRAPH_SERIES_ID } from "../../util/dependencyGraphSeries"
import { DependencyGraphHandlers, DependencyGraphHost, DOUBLE_CLICK_MS, POINTER_LEAVE_GRACE_MS } from "./dependencyGraphHost"

jest.mock("echarts/core", () => jest.requireActual("../../testing/dependencyGraph.stub").echartsCoreStub)

const BOX = { seriesId: GRAPH_SERIES_ID, name: "/root/app/a.ts" }
const EDGE = { seriesId: GRAPH_SERIES_ID, data: { isEdge: true } }
const PRIMARY_PRESS = { offsetX: 10, offsetY: 10, event: { button: 0 } }

describe("DependencyGraphHost", () => {
    let handlers: DependencyGraphHandlers
    let host: DependencyGraphHost
    let container: HTMLElement

    beforeEach(() => {
        resetStubbedChart()
        stubResizeObserver()
        handlers = {
            onBoxClicked: jest.fn(),
            onBoxToggled: jest.fn(),
            onBoxHovered: jest.fn(),
            onBoxRightClicked: jest.fn(),
            onRendered: jest.fn(),
            canDragBox: jest.fn(() => true),
            onBoxDragged: jest.fn(),
            boxAt: jest.fn(() => "/root/app"),
            onBoxDragEnded: jest.fn()
        }
        host = new DependencyGraphHost(handlers)
        container = elementOfSize(800, 600)
        host.attachTo(container)
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it("should create one chart per container and publish the container's size", () => {
        // Arrange
        const sameContainer = container

        // Act
        host.attachTo(sameContainer)

        // Assert
        expect(echarts.init).toHaveBeenCalledTimes(1)
        expect(host.containerSize()).toEqual({ width: 800, height: 600 })
    })

    it("should report a click on a box with its path", () => {
        // Arrange
        const clickOnBox = BOX

        // Act
        fireChartEvent("click", clickOnBox)

        // Assert
        expect(handlers.onBoxClicked).toHaveBeenCalledWith("/root/app/a.ts")
        expect(handlers.onBoxToggled).not.toHaveBeenCalled()
    })

    it("should not report clicks outside every box", () => {
        // Arrange
        const clickOnNoBox = { seriesId: GRAPH_SERIES_ID }

        // Act
        fireChartEvent("click", clickOnNoBox)

        // Assert
        expect(handlers.onBoxClicked).not.toHaveBeenCalled()
    })

    it("should hand a click on an edge lying over a box to that box", () => {
        // Arrange
        const clickOnEdge = { ...EDGE, event: { offsetX: 30, offsetY: 40 } }

        // Act
        fireChartEvent("click", clickOnEdge)

        // Assert
        expect(handlers.boxAt).toHaveBeenCalledWith([30, 40])
        expect(handlers.onBoxClicked).toHaveBeenCalledWith("/root/app")
    })

    it("should ignore a click on an edge over no box", () => {
        // Arrange
        handlers.boxAt = jest.fn(() => null)

        // Act
        fireChartEvent("click", { ...EDGE, event: { offsetX: 30, offsetY: 40 } })

        // Assert
        expect(handlers.onBoxClicked).not.toHaveBeenCalled()
    })

    it("should toggle the box the first click landed on when the browser reports a double click", () => {
        // Arrange
        jest.useFakeTimers()
        fireChartEvent("click", BOX)
        jest.advanceTimersByTime(DOUBLE_CLICK_MS)

        // Act
        container.dispatchEvent(new MouseEvent("dblclick"))

        // Assert
        expect(handlers.onBoxClicked).toHaveBeenCalledTimes(1)
        expect(handlers.onBoxToggled).toHaveBeenCalledWith("/root/app/a.ts")
    })

    it("should toggle nothing on a double click that follows no recent box click", () => {
        // Arrange
        jest.useFakeTimers()
        fireChartEvent("click", BOX)
        jest.advanceTimersByTime(DOUBLE_CLICK_MS + 1)

        // Act
        container.dispatchEvent(new MouseEvent("dblclick"))
        container.dispatchEvent(new MouseEvent("dblclick"))

        // Assert
        expect(handlers.onBoxToggled).not.toHaveBeenCalled()
    })

    it("should stop listening for double clicks once disposed", () => {
        // Arrange
        fireChartEvent("click", BOX)
        host.dispose()

        // Act
        container.dispatchEvent(new MouseEvent("dblclick"))

        // Assert
        expect(handlers.onBoxToggled).not.toHaveBeenCalled()
    })

    it("should drag a pressed box and select a box on the first click after the drag", () => {
        // Arrange
        jest.useFakeTimers()
        fireChartEvent("mousedown", { ...BOX, event: PRIMARY_PRESS })
        fireRenderSurfaceEvent("mousemove", { offsetX: 40, offsetY: 30, target: {} })
        fireRenderSurfaceEvent("mouseup")

        // Act
        fireChartEvent("mousedown", { ...BOX, event: PRIMARY_PRESS })
        fireRenderSurfaceEvent("mouseup")
        fireChartEvent("click", BOX)

        // Assert
        expect(handlers.onBoxDragged).toHaveBeenCalledWith("/root/app/a.ts", 30, 20)
        expect(handlers.onBoxClicked).toHaveBeenCalledWith("/root/app/a.ts")
    })

    it("should not select a box on the click that still follows a drag within the click tolerance", () => {
        // Arrange
        fireChartEvent("mousedown", { ...BOX, event: PRIMARY_PRESS })
        fireRenderSurfaceEvent("mousemove", { offsetX: 14, offsetY: 10, target: {} })
        fireRenderSurfaceEvent("mouseup")

        // Act
        fireChartEvent("click", BOX)

        // Assert
        expect(handlers.onBoxClicked).not.toHaveBeenCalled()
    })

    it("should end a drag when the pointer leaves the chart and select a box on the next click", () => {
        // Arrange
        fireChartEvent("mousedown", { ...BOX, event: PRIMARY_PRESS })
        fireRenderSurfaceEvent("mousemove", { offsetX: 40, offsetY: 30, target: {} })
        fireRenderSurfaceEvent("globalout")
        const dragsBeforeLeaving = (handlers.onBoxDragged as jest.Mock).mock.calls.length

        // Act
        fireRenderSurfaceEvent("mousemove", { offsetX: 90, offsetY: 90, target: {} })
        fireChartEvent("mousedown", { ...BOX, event: PRIMARY_PRESS })
        fireChartEvent("click", BOX)

        // Assert
        expect(handlers.onBoxDragged).toHaveBeenCalledTimes(dragsBeforeLeaving)
        expect(handlers.onBoxClicked).toHaveBeenCalledWith("/root/app/a.ts")
    })

    it("should not start a drag on a press outside every box", () => {
        // Arrange
        handlers.boxAt = jest.fn(() => null)

        // Act
        fireChartEvent("mousedown", { ...EDGE, event: { offsetX: 10, offsetY: 10 } })

        // Assert
        expect(handlers.canDragBox).not.toHaveBeenCalled()
    })

    it("should report a right click with the pointer position", () => {
        // Arrange
        const rightClick = { ...BOX, event: { event: { clientX: 12, clientY: 34 } } }

        // Act
        fireChartEvent("contextmenu", rightClick)

        // Assert
        expect(handlers.onBoxRightClicked).toHaveBeenCalledWith("/root/app/a.ts", 12, 34)
    })

    it("should report a hover at once and its end only after a grace period", () => {
        // Arrange
        jest.useFakeTimers()
        fireChartEvent("mouseover", BOX)

        // Act
        fireChartEvent("mouseout")
        const hoversBeforeGrace = (handlers.onBoxHovered as jest.Mock).mock.calls.length
        jest.advanceTimersByTime(POINTER_LEAVE_GRACE_MS)

        // Assert
        expect(hoversBeforeGrace).toBe(1)
        expect(handlers.onBoxHovered).toHaveBeenLastCalledWith(null)
    })

    it("should keep hovering the box an edge crosses when the pointer moves onto the edge", () => {
        // Arrange
        jest.useFakeTimers()
        fireChartEvent("mouseover", { ...BOX, name: "/root/app" })

        // Act
        fireChartEvent("mouseout")
        fireChartEvent("mouseover", { ...EDGE, event: { offsetX: 30, offsetY: 40 } })
        jest.advanceTimersByTime(POINTER_LEAVE_GRACE_MS)

        // Assert
        expect(handlers.boxAt).toHaveBeenCalledWith([30, 40])
        expect(handlers.onBoxHovered).toHaveBeenCalledTimes(1)
        expect(handlers.onBoxHovered).toHaveBeenLastCalledWith("/root/app")
    })

    it("should not report the pointer over an edge over no box as a hovered box", () => {
        // Arrange
        handlers.boxAt = jest.fn(() => null)

        // Act
        fireChartEvent("mouseover", { ...EDGE, event: { offsetX: 30, offsetY: 40 } })

        // Assert
        expect(handlers.onBoxHovered).not.toHaveBeenCalled()
    })

    it("should keep the hover when the pointer moves on to another box within the grace period", () => {
        // Arrange
        jest.useFakeTimers()
        fireChartEvent("mouseover", BOX)

        // Act
        fireChartEvent("mouseout")
        fireChartEvent("mouseover", { ...BOX, name: "/root/app" })
        jest.advanceTimersByTime(POINTER_LEAVE_GRACE_MS)

        // Assert
        expect(handlers.onBoxHovered).toHaveBeenLastCalledWith("/root/app")
    })

    it("should end the hover when the pointer rests over nothing or leaves the chart", () => {
        // Arrange
        jest.useFakeTimers()
        fireChartEvent("mouseover", BOX)

        // Act
        fireRenderSurfaceEvent("mousemove", { target: undefined })
        fireRenderSurfaceEvent("globalout")
        jest.advanceTimersByTime(POINTER_LEAVE_GRACE_MS)

        // Assert
        expect(handlers.onBoxHovered).toHaveBeenLastCalledWith(null)
    })

    it("should mark the chart busy while drawing and report when it is done", () => {
        // Arrange
        const option = { series: [] }

        // Act
        host.render(option)
        const busyWhileDrawing = container.getAttribute("aria-busy")
        fireChartEvent("finished")

        // Assert
        expect(stubbedChart.setOption).toHaveBeenCalledWith(option)
        expect(busyWhileDrawing).toBe("true")
        expect(container.getAttribute("aria-busy")).toBe("false")
        expect(handlers.onRendered).toHaveBeenCalled()
    })

    it("should resize the chart only when its container's size has changed", () => {
        // Arrange
        host.render({})
        host.render({})
        const resizesAtFirstSize = stubbedChart.resize.mock.calls.length
        Object.defineProperty(container, "clientWidth", { value: 1000, configurable: true })
        reportResize()

        // Act
        host.render({})
        host.render({})

        // Assert
        expect(resizesAtFirstSize).toBe(1)
        expect(stubbedChart.resize).toHaveBeenCalledTimes(2)
    })

    it("should zoom and pan both axes to a window in layout units", () => {
        // Arrange
        const layoutWindow: AxisWindow = { x: [-10, 90], y: [5, 65] }

        // Act
        host.fitTo(layoutWindow)

        // Assert
        expect(stubbedChart.dispatchAction).toHaveBeenCalledWith({
            type: "dataZoom",
            batch: [
                { dataZoomIndex: 0, startValue: -10, endValue: 90 },
                { dataZoomIndex: 1, startValue: 5, endValue: 65 }
            ]
        })
    })

    it("should end a hover and release the chart when disposed", () => {
        // Arrange
        fireChartEvent("mouseover", BOX)

        // Act
        host.dispose()
        host.render({})

        // Assert
        expect(handlers.onBoxHovered).toHaveBeenLastCalledWith(null)
        expect(stubbedChart.dispose).toHaveBeenCalled()
        expect(stubbedChart.setOption).not.toHaveBeenCalled()
    })
})
