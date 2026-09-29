import * as echarts from "echarts/core"
import {
    elementOfSize,
    fireChartEvent,
    fireRenderSurfaceEvent,
    resetStubbedChart,
    stubbedChart,
    stubResizeObserver
} from "../../testing/dependencyGraph.stub"
import { GRAPH_SERIES_ID } from "../../util/dependencyGraphSeries"
import { DependencyGraphHandlers, DependencyGraphHost, DOUBLE_CLICK_MS, POINTER_LEAVE_GRACE_MS } from "./dependencyGraphHost"

jest.mock("echarts/core", () => jest.requireActual("../../testing/dependencyGraph.stub").echartsCoreStub)

const BOX = { seriesId: GRAPH_SERIES_ID, name: "/root/app/a.ts" }
const EDGE = { seriesId: GRAPH_SERIES_ID, data: { isEdge: true } }

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
            boxAt: jest.fn(() => "/root/app")
        }
        host = new DependencyGraphHost(handlers)
        container = elementOfSize(800, 600)
        host.attachTo(container)
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it("should create one chart per container and publish the container's size", () => {
        // Act
        host.attachTo(container)

        // Assert
        expect(echarts.init).toHaveBeenCalledTimes(1)
        expect(host.containerSize()).toEqual({ width: 800, height: 600 })
    })

    it("should report a click on a box with its path", () => {
        // Act
        fireChartEvent("click", BOX)

        // Assert
        expect(handlers.onBoxClicked).toHaveBeenCalledWith("/root/app/a.ts")
        expect(handlers.onBoxToggled).not.toHaveBeenCalled()
    })

    it("should not report clicks outside every box", () => {
        // Act
        fireChartEvent("click", { seriesId: GRAPH_SERIES_ID })

        // Assert
        expect(handlers.onBoxClicked).not.toHaveBeenCalled()
    })

    it("should hand a click on an edge lying over a box to that box", () => {
        // Act
        fireChartEvent("click", { ...EDGE, event: { offsetX: 30, offsetY: 40 } })

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

        // Act
        fireChartEvent("click", BOX)
        jest.advanceTimersByTime(DOUBLE_CLICK_MS)
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

    it("should drag a pressed box and not select it on the click that ends the drag", () => {
        // Arrange
        jest.useFakeTimers()
        const press = { offsetX: 10, offsetY: 10, event: { button: 0 } }

        // Act
        fireChartEvent("mousedown", { ...BOX, event: press })
        fireRenderSurfaceEvent("mousemove", { offsetX: 40, offsetY: 30, target: {} })
        fireRenderSurfaceEvent("mouseup")
        fireChartEvent("click", BOX)

        // Assert
        expect(handlers.onBoxDragged).toHaveBeenCalledWith("/root/app/a.ts", 30, 20)
        expect(handlers.onBoxClicked).not.toHaveBeenCalled()
    })

    it("should end a drag when the pointer leaves the chart", () => {
        // Arrange
        fireChartEvent("mousedown", { ...BOX, event: { offsetX: 10, offsetY: 10, event: { button: 0 } } })

        // Act
        fireRenderSurfaceEvent("globalout")
        fireRenderSurfaceEvent("mousemove", { offsetX: 90, offsetY: 90, target: {} })

        // Assert
        expect(handlers.onBoxDragged).not.toHaveBeenCalled()
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
        // Act
        fireChartEvent("contextmenu", { ...BOX, event: { event: { clientX: 12, clientY: 34 } } })

        // Assert
        expect(handlers.onBoxRightClicked).toHaveBeenCalledWith("/root/app/a.ts", 12, 34)
    })

    it("should report a hover at once and its end only after a grace period", () => {
        // Arrange
        jest.useFakeTimers()

        // Act
        fireChartEvent("mouseover", BOX)
        fireChartEvent("mouseout")
        const hoversBeforeGrace = (handlers.onBoxHovered as jest.Mock).mock.calls.length
        jest.advanceTimersByTime(POINTER_LEAVE_GRACE_MS)

        // Assert
        expect(hoversBeforeGrace).toBe(1)
        expect(handlers.onBoxHovered).toHaveBeenLastCalledWith(null)
    })

    it("should not report the pointer over an edge as a hovered box", () => {
        // Act
        fireChartEvent("mouseover", EDGE)

        // Assert
        expect(handlers.onBoxHovered).not.toHaveBeenCalled()
    })

    it("should keep the hover when the pointer moves on to another box within the grace period", () => {
        // Arrange
        jest.useFakeTimers()

        // Act
        fireChartEvent("mouseover", BOX)
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
        // Act
        host.render({ series: [] })
        const busyWhileDrawing = container.getAttribute("aria-busy")
        fireChartEvent("finished")

        // Assert
        expect(stubbedChart.setOption).toHaveBeenCalledWith({ series: [] })
        expect(busyWhileDrawing).toBe("true")
        expect(container.getAttribute("aria-busy")).toBe("false")
        expect(handlers.onRendered).toHaveBeenCalled()
    })

    it("should zoom both axes back out to the whole graph", () => {
        // Act
        host.resetView()

        // Assert
        expect(stubbedChart.dispatchAction).toHaveBeenCalledWith({
            type: "dataZoom",
            batch: [
                { dataZoomIndex: 0, start: 0, end: 100 },
                { dataZoomIndex: 1, start: 0, end: 100 }
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
