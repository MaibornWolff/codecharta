import * as echarts from "echarts/core"
import {
    elementOfSize,
    fireChartEvent,
    fireRenderSurfaceEvent,
    resetStubbedChart,
    stubbedChart,
    stubResizeObserver
} from "../../testing/dependencyGraph.stub"
import { SERIES_IDS } from "../../util/dependencyGraphSeries"
import { DependencyGraphHandlers, DependencyGraphHost, DOUBLE_CLICK_MS, POINTER_LEAVE_GRACE_MS } from "./dependencyGraphHost"

jest.mock("echarts/core", () => jest.requireActual("../../testing/dependencyGraph.stub").echartsCoreStub)

const BOX = { seriesId: SERIES_IDS.boxes, name: "/root/app/a.ts" }

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
            onRendered: jest.fn()
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
        fireChartEvent("click", { seriesId: SERIES_IDS.boxes })

        // Assert
        expect(handlers.onBoxClicked).not.toHaveBeenCalled()
    })

    it("should report a click on an open folder with its path", () => {
        // Act
        fireChartEvent("click", { seriesId: SERIES_IDS.openFolders, name: "/root/app" })

        // Assert
        expect(handlers.onBoxClicked).toHaveBeenCalledWith("/root/app")
    })

    it("should ignore clicks on edges", () => {
        // Act
        fireChartEvent("click", { seriesId: SERIES_IDS.edges, name: undefined })

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
        fireChartEvent("mouseover", { seriesId: SERIES_IDS.edges, name: undefined })

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
