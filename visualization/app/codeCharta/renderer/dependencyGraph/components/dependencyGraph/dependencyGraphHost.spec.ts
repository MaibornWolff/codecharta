import * as echarts from "echarts/core"
import { DependencyGraphChartRegistry } from "../../services/dependencyGraphChart.registry"
import {
    elementOfSize,
    fireChartEvent,
    fireRenderSurfaceEvent,
    reportResize,
    resetStubbedChart,
    stubbedChart,
    stubResizeObserver
} from "../../testing/dependencyGraph.stub"
import { GRAPH_SERIES_ID } from "../../util/dependencyGraphSeries"
import { DOUBLE_CLICK_MS, SINGLE_CLICK_WAIT_MS } from "./boxClickGesture"
import { DependencyGraphHandlers, DependencyGraphHost, POINTER_LEAVE_GRACE_MS } from "./dependencyGraphHost"

jest.mock("echarts/core", () => jest.requireActual("../../testing/dependencyGraph.stub").echartsCoreStub)

const BOX = { seriesId: GRAPH_SERIES_ID, name: "/root/app/a.ts" }
const EDGE = { seriesId: GRAPH_SERIES_ID, data: { isEdge: true, edgeId: "/root/app/a.ts|/root/app/b.ts" } }
const PRIMARY_PRESS = { offsetX: 10, offsetY: 10, event: { button: 0 } }

describe("DependencyGraphHost", () => {
    let handlers: DependencyGraphHandlers
    let host: DependencyGraphHost
    let registry: DependencyGraphChartRegistry
    let container: HTMLElement

    beforeEach(() => {
        resetStubbedChart()
        stubResizeObserver()
        handlers = {
            onBoxClicked: jest.fn(),
            onBoxToggled: jest.fn(),
            onCycleBadgeClicked: jest.fn(),
            onUpwardBadgeClicked: jest.fn(),
            onEdgeClicked: jest.fn(),
            onBoxHovered: jest.fn(),
            onBoxRightClicked: jest.fn(),
            onRendered: jest.fn(),
            canDragBox: jest.fn(() => true),
            onBoxDragged: jest.fn(),
            boxAt: jest.fn(() => "/root/app"),
            onBoxDragEnded: jest.fn()
        }
        registry = new DependencyGraphChartRegistry()
        host = new DependencyGraphHost(registry, handlers)
        container = elementOfSize(800, 600)
        host.attachTo(container)
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it("should create one chart per container, register it for screenshots and publish the container's size", () => {
        // Arrange
        const sameContainer = container

        // Act
        host.attachTo(sameContainer)

        // Assert
        expect(echarts.init).toHaveBeenCalledTimes(1)
        expect(registry.current()).toBe(stubbedChart)
        expect(host.containerSize()).toEqual({ width: 800, height: 600 })
    })

    it("should report a click on a box with its path once no second click followed it", () => {
        // Arrange
        jest.useFakeTimers()

        // Act
        fireChartEvent("click", BOX)
        const reportedAtOnce = (handlers.onBoxClicked as jest.Mock).mock.calls.length
        jest.advanceTimersByTime(SINGLE_CLICK_WAIT_MS)

        // Assert
        expect(reportedAtOnce).toBe(0)
        expect(handlers.onBoxClicked).toHaveBeenCalledWith("/root/app/a.ts")
        expect(handlers.onBoxToggled).not.toHaveBeenCalled()
    })

    it("should toggle a double clicked box without reporting a click on it", () => {
        // Arrange
        jest.useFakeTimers()

        // Act
        fireChartEvent("click", BOX)
        fireChartEvent("click", BOX)
        container.dispatchEvent(new MouseEvent("dblclick"))
        jest.runAllTimers()

        // Assert
        expect(handlers.onBoxToggled).toHaveBeenCalledTimes(1)
        expect(handlers.onBoxToggled).toHaveBeenCalledWith("/root/app/a.ts")
        expect(handlers.onBoxClicked).not.toHaveBeenCalled()
    })

    it("should toggle neither box when the two clicks of a double click landed on different boxes, and select the second", () => {
        // Arrange
        jest.useFakeTimers()
        const otherBox = { ...BOX, name: "/root/app/b.ts" }

        // Act
        fireChartEvent("click", BOX)
        fireChartEvent("click", otherBox)
        container.dispatchEvent(new MouseEvent("dblclick"))
        jest.runAllTimers()

        // Assert
        expect(handlers.onBoxToggled).not.toHaveBeenCalled()
        expect(handlers.onBoxClicked).toHaveBeenCalledTimes(1)
        expect(handlers.onBoxClicked).toHaveBeenCalledWith("/root/app/b.ts")
    })

    it("should toggle a box double clicked right after a click on another box", () => {
        // Arrange
        jest.useFakeTimers()
        const otherBox = { ...BOX, name: "/root/app/b.ts" }
        fireChartEvent("click", BOX)

        // Act
        fireChartEvent("click", otherBox)
        fireChartEvent("click", otherBox)
        container.dispatchEvent(new MouseEvent("dblclick"))
        jest.runAllTimers()

        // Assert
        expect(handlers.onBoxToggled).toHaveBeenCalledTimes(1)
        expect(handlers.onBoxToggled).toHaveBeenCalledWith("/root/app/b.ts")
        expect(handlers.onBoxClicked).not.toHaveBeenCalled()
    })

    it("should report the click on an edge alone when it follows a click on a box", () => {
        // Arrange
        jest.useFakeTimers()
        fireChartEvent("click", BOX)

        // Act
        fireChartEvent("click", { ...EDGE, event: { offsetX: 30, offsetY: 40 } })
        jest.runAllTimers()

        // Assert
        expect(handlers.onEdgeClicked).toHaveBeenCalledTimes(1)
        expect(handlers.onBoxClicked).not.toHaveBeenCalled()
    })

    it("should report no click once disposed", () => {
        // Arrange
        jest.useFakeTimers()
        fireChartEvent("click", BOX)

        // Act
        host.dispose()
        jest.runAllTimers()

        // Assert
        expect(handlers.onBoxClicked).not.toHaveBeenCalled()
    })

    it("should let no double click toggle a box whose cycle badge the first click landed on", () => {
        // Arrange
        const badgeOfBox = { ...BOX, info: "cycleBadge" }

        // Act
        fireChartEvent("click", badgeOfBox)
        container.dispatchEvent(new MouseEvent("dblclick"))

        // Assert
        expect(handlers.onCycleBadgeClicked).toHaveBeenCalledTimes(1)
        expect(handlers.onBoxToggled).not.toHaveBeenCalled()
        expect(handlers.onBoxClicked).not.toHaveBeenCalled()
    })

    it("should report a click on the cycle badge of an open box, which is drawn with its title apart from the box", () => {
        // Arrange
        const badgeInTitle = { seriesId: GRAPH_SERIES_ID, name: "", data: { titledBoxPath: "/root/app" }, info: "cycleBadge" }

        // Act
        fireChartEvent("click", badgeInTitle)

        // Assert
        expect(handlers.onCycleBadgeClicked).toHaveBeenCalledWith("/root/app")
    })

    it("should report a click on a box's cycle badge as such, not as a click on the box", () => {
        // Arrange
        const badgeOfBox = { ...BOX, info: "cycleBadge" }

        // Act
        fireChartEvent("click", badgeOfBox)

        // Assert
        expect(handlers.onCycleBadgeClicked).toHaveBeenCalledWith("/root/app/a.ts")
        expect(handlers.onBoxClicked).not.toHaveBeenCalled()
    })

    it("should report a click on a box's upward badge as such, not as a click on the box", () => {
        // Arrange
        const badgeOfBox = { ...BOX, info: "upwardBadge" }

        // Act
        fireChartEvent("click", badgeOfBox)

        // Assert
        expect(handlers.onUpwardBadgeClicked).toHaveBeenCalledWith("/root/app/a.ts")
        expect(handlers.onCycleBadgeClicked).not.toHaveBeenCalled()
        expect(handlers.onBoxClicked).not.toHaveBeenCalled()
    })

    it("should not report clicks outside every box", () => {
        // Arrange
        const clickOnNoBox = { seriesId: GRAPH_SERIES_ID }

        // Act
        fireChartEvent("click", clickOnNoBox)

        // Assert
        expect(handlers.onBoxClicked).not.toHaveBeenCalled()
    })

    it("should report a click on an edge with the edge's id, whatever box lies under it, and let no double click toggle that box", () => {
        // Arrange
        const clickOnEdge = { ...EDGE, event: { offsetX: 30, offsetY: 40 } }

        // Act
        fireChartEvent("click", clickOnEdge)
        container.dispatchEvent(new MouseEvent("dblclick"))

        // Assert
        expect(handlers.onEdgeClicked).toHaveBeenCalledWith("/root/app/a.ts|/root/app/b.ts")
        expect(handlers.onBoxClicked).not.toHaveBeenCalled()
        expect(handlers.onBoxToggled).not.toHaveBeenCalled()
    })

    it("should toggle the box the first click landed on when the browser reports a slow double click", () => {
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
        jest.runAllTimers()

        // Assert
        expect(handlers.onBoxDragged).toHaveBeenCalledWith("/root/app/a.ts", 30, 20)
        expect(handlers.onBoxClicked).toHaveBeenCalledWith("/root/app/a.ts")
    })

    it("should not select a box on the click that still follows a drag within the click tolerance", () => {
        // Arrange
        jest.useFakeTimers()
        fireChartEvent("mousedown", { ...BOX, event: PRIMARY_PRESS })
        fireRenderSurfaceEvent("mousemove", { offsetX: 14, offsetY: 10, target: {} })
        fireRenderSurfaceEvent("mouseup")

        // Act
        fireChartEvent("click", BOX)
        jest.runAllTimers()

        // Assert
        expect(handlers.onBoxClicked).not.toHaveBeenCalled()
    })

    it("should end a drag when the pointer leaves the chart and select a box on the next click", () => {
        // Arrange
        jest.useFakeTimers()
        fireChartEvent("mousedown", { ...BOX, event: PRIMARY_PRESS })
        fireRenderSurfaceEvent("mousemove", { offsetX: 40, offsetY: 30, target: {} })
        fireRenderSurfaceEvent("globalout")
        const dragsBeforeLeaving = (handlers.onBoxDragged as jest.Mock).mock.calls.length

        // Act
        fireRenderSurfaceEvent("mousemove", { offsetX: 90, offsetY: 90, target: {} })
        fireChartEvent("mousedown", { ...BOX, event: PRIMARY_PRESS })
        fireChartEvent("click", BOX)
        jest.runAllTimers()

        // Assert
        expect(handlers.onBoxDragged).toHaveBeenCalledTimes(dragsBeforeLeaving)
        expect(handlers.onBoxClicked).toHaveBeenCalledWith("/root/app/a.ts")
    })

    it("should leave a press on a box to the graph's pan while space is held over the graph", () => {
        // Arrange
        jest.useFakeTimers()
        container.dispatchEvent(new MouseEvent("mouseenter"))
        window.dispatchEvent(new KeyboardEvent("keydown", { key: " ", cancelable: true }))

        // Act
        fireChartEvent("mousedown", { ...BOX, event: PRIMARY_PRESS })
        fireRenderSurfaceEvent("mousemove", { offsetX: 40, offsetY: 30, target: {} })
        fireRenderSurfaceEvent("mouseup")
        jest.runAllTimers()
        window.dispatchEvent(new KeyboardEvent("keyup", { key: " " }))

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
        // Arrange
        const rightClick = { ...BOX, event: { event: { clientX: 12, clientY: 34 } } }

        // Act
        fireChartEvent("contextmenu", rightClick)

        // Assert
        expect(handlers.onBoxRightClicked).toHaveBeenCalledWith("/root/app/a.ts", 12, 34)
    })

    it("should pan the graph with a drag of the right button, from a box too, and open no context menu for it", () => {
        // Arrange
        host.render({})
        const rightClick = { ...BOX, event: { event: { clientX: 100, clientY: 100 } } }
        container.dispatchEvent(new MouseEvent("mousedown", { button: 2, buttons: 2, clientX: 100, clientY: 100 }))
        fireChartEvent("contextmenu", rightClick)

        // Act
        window.dispatchEvent(new MouseEvent("mousemove", { buttons: 2, clientX: 150, clientY: 80 }))
        window.dispatchEvent(new MouseEvent("mouseup", { button: 2 }))

        // Assert
        expect(stubbedChart.dispatchAction).toHaveBeenCalledWith({
            type: "dataZoom",
            batch: [
                { dataZoomIndex: 0, startValue: -50, endValue: 750 },
                { dataZoomIndex: 1, startValue: 20, endValue: 620 }
            ]
        })
        expect(handlers.onBoxRightClicked).not.toHaveBeenCalled()
        expect(handlers.onBoxDragged).not.toHaveBeenCalled()
    })

    it("should pan nothing with the right button while the chart has no size to tell a drag's length by", () => {
        // Arrange
        const emptyContainer = elementOfSize(0, 0)
        host.attachTo(emptyContainer)
        host.render({})

        // Act
        emptyContainer.dispatchEvent(new MouseEvent("mousedown", { button: 2, buttons: 2, clientX: 100, clientY: 100 }))
        window.dispatchEvent(new MouseEvent("mousemove", { buttons: 2, clientX: 150, clientY: 80 }))
        window.dispatchEvent(new MouseEvent("mouseup", { button: 2 }))

        // Assert
        expect(stubbedChart.dispatchAction).not.toHaveBeenCalled()
    })

    it("should pan nothing with the right button before anything is drawn or once disposed", () => {
        // Arrange
        const dragWithTheRightButton = () => {
            container.dispatchEvent(new MouseEvent("mousedown", { button: 2, buttons: 2, clientX: 100, clientY: 100 }))
            window.dispatchEvent(new MouseEvent("mousemove", { buttons: 2, clientX: 150, clientY: 80 }))
            window.dispatchEvent(new MouseEvent("mouseup", { button: 2 }))
        }

        // Act
        dragWithTheRightButton()
        host.render({})
        host.dispose()
        dragWithTheRightButton()

        // Assert
        expect(stubbedChart.dispatchAction).not.toHaveBeenCalled()
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

    it("should read the window it shows in layout units and carry it over to a resized chart at the same scale", () => {
        // Arrange
        const twoPixelsPerUnitFrom100 = (_finder: unknown, [x, y]: number[]) => [x / 2 + 100, y / 2 + 100]
        stubbedChart.convertFromPixel.mockImplementation(twoPixelsPerUnitFrom100)
        host.render({})

        // Act
        const windowAtSameSize = host.shownWindowFor({ width: 800, height: 600 })
        const windowAtHalfWidth = host.shownWindowFor({ width: 400, height: 600 })

        // Assert
        expect(windowAtSameSize).toEqual({ x: [100, 500], y: [100, 400] })
        expect(windowAtHalfWidth).toEqual({ x: [200, 400], y: [100, 400] })
    })

    it("should tell where a part of the graph lies on the container, and nothing before it has drawn anything", () => {
        // Arrange
        stubbedChart.convertToPixel.mockImplementation((_finder: unknown, [x, y]: number[]) => [x * 2, y * 2 + 10])
        const box = { x: 10, y: 20, width: 100, height: 40 }
        const beforeDrawing = host.pixelRectOf(box)

        // Act
        host.render({})

        // Assert
        expect(beforeDrawing).toBeNull()
        expect(host.pixelRectOf(box)).toEqual({ x: 20, y: 50, width: 200, height: 80 })
    })

    it("should know no shown window before it has drawn anything", () => {
        // Arrange
        const viewport = { width: 800, height: 600 }

        // Act
        const shownWindow = host.shownWindowFor(viewport)

        // Assert
        expect(shownWindow).toBeNull()
        expect(stubbedChart.convertFromPixel).not.toHaveBeenCalled()
    })

    it("should know no shown window while the chart maps pixels to no layout point", () => {
        // Arrange
        stubbedChart.convertFromPixel.mockImplementation(() => [Number.NaN, Number.NaN])
        host.render({})

        // Act
        const shownWindow = host.shownWindowFor({ width: 800, height: 600 })

        // Assert
        expect(shownWindow).toBeNull()
    })

    it("should end a hover and release the chart and its registration when disposed", () => {
        // Arrange
        fireChartEvent("mouseover", BOX)

        // Act
        host.dispose()
        host.render({})

        // Assert
        expect(handlers.onBoxHovered).toHaveBeenLastCalledWith(null)
        expect(stubbedChart.dispose).toHaveBeenCalled()
        expect(registry.current()).toBeNull()
        expect(stubbedChart.setOption).not.toHaveBeenCalled()
    })
})
