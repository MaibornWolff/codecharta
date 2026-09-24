import * as echarts from "echarts/core"
import { RadialChartRegistry } from "../../services/radialChart.registry"
import {
    elementOfSize,
    fireChartEvent,
    resetStubbedChart,
    resizeObserverDisconnect,
    stubbedChart,
    stubResizeObserver
} from "../../testing/radialChart.stub"
import { POINTER_LEAVE_GRACE_MS, RadialChartHandlers, RadialChartHost } from "./radialChartHost"

jest.mock("echarts/core", () => jest.requireActual("../../testing/radialChart.stub").echartsCoreStub)

const SOME_OPTION = {} as never

describe("RadialChartHost", () => {
    let registry: RadialChartRegistry
    let handlers: RadialChartHandlers
    let host: RadialChartHost

    beforeEach(() => {
        resetStubbedChart()
        stubResizeObserver()
        registry = new RadialChartRegistry()
        handlers = {
            onFolderClicked: jest.fn(),
            onFileClicked: jest.fn(),
            onCentreClicked: jest.fn(),
            onNodeHovered: jest.fn(),
            onNodeRightClicked: jest.fn()
        }
        host = new RadialChartHost(registry, handlers)
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it("should create one chart per container, register it for screenshots and publish the container's size", () => {
        // Arrange
        const container = elementOfSize(800, 600)

        // Act
        host.attachTo(container)
        host.attachTo(container)

        // Assert
        expect(echarts.init).toHaveBeenCalledTimes(1)
        expect(registry.current()).toBe(stubbedChart)
        expect(host.containerSize()).toEqual({ width: 800, height: 600 })
    })

    it("should report a click on a ring segment as a folder click with its path", () => {
        // Arrange
        host.attachTo(elementOfSize(800, 600))

        // Act
        fireChartEvent("click", { data: { name: "/root/src", isCentre: false } })

        // Assert
        expect(handlers.onFolderClicked).toHaveBeenCalledWith("/root/src")
        expect(handlers.onCentreClicked).not.toHaveBeenCalled()
    })

    it("should report a click on the centre as a request to go up", () => {
        // Arrange
        host.attachTo(elementOfSize(800, 600))

        // Act
        fireChartEvent("click", { data: { name: "/root/src", isCentre: true } })

        // Assert
        expect(handlers.onCentreClicked).toHaveBeenCalled()
        expect(handlers.onFolderClicked).not.toHaveBeenCalled()
    })

    it("should report a click on a file as a file click, which does not drill", () => {
        // Arrange
        host.attachTo(elementOfSize(800, 600))

        // Act
        fireChartEvent("click", { data: { name: "/root/a.ts", isCentre: false, isFile: true } })

        // Assert
        expect(handlers.onFileClicked).toHaveBeenCalledWith("/root/a.ts")
        expect(handlers.onFolderClicked).not.toHaveBeenCalled()
    })

    it("should ignore clicks that hit no segment", () => {
        // Arrange
        host.attachTo(elementOfSize(800, 600))

        // Act
        fireChartEvent("click")

        // Assert
        expect(handlers.onCentreClicked).not.toHaveBeenCalled()
        expect(handlers.onFolderClicked).not.toHaveBeenCalled()
    })

    it("should report a right click on a segment with where it happened, instead of the browser's menu", () => {
        // Arrange
        const container = elementOfSize(800, 600)
        host.attachTo(container)
        const browserMenu = new MouseEvent("contextmenu", { cancelable: true })

        // Act
        fireChartEvent("contextmenu", { data: { name: "/root/src" }, event: { event: { clientX: 12, clientY: 34 } } })
        fireChartEvent("contextmenu", { event: { event: { clientX: 1, clientY: 2 } } })
        container.dispatchEvent(browserMenu)

        // Assert
        expect(handlers.onNodeRightClicked).toHaveBeenCalledTimes(1)
        expect(handlers.onNodeRightClicked).toHaveBeenCalledWith("/root/src", 12, 34)
        expect(browserMenu.defaultPrevented).toBe(true)
    })

    it("should report hovering a segment and, a moment after the pointer left, leaving it", () => {
        // Arrange
        jest.useFakeTimers()
        host.attachTo(elementOfSize(800, 600))

        // Act
        fireChartEvent("mouseover", { data: { name: "/root/src" } })
        fireChartEvent("mouseout")
        jest.advanceTimersByTime(POINTER_LEAVE_GRACE_MS)

        // Assert
        expect(handlers.onNodeHovered).toHaveBeenNthCalledWith(1, "/root/src")
        expect(handlers.onNodeHovered).toHaveBeenNthCalledWith(2, null)
    })

    it("should not report the gap while the pointer moves from one segment to the next", () => {
        // Arrange
        jest.useFakeTimers()
        host.attachTo(elementOfSize(800, 600))
        fireChartEvent("mouseover", { data: { name: "/root/src" } })

        // Act
        fireChartEvent("mouseout")
        fireChartEvent("mouseover", { data: { name: "/root/test" } })
        jest.advanceTimersByTime(POINTER_LEAVE_GRACE_MS)

        // Assert
        expect(handlers.onNodeHovered).not.toHaveBeenCalledWith(null)
        expect(handlers.onNodeHovered).toHaveBeenLastCalledWith("/root/test")
    })

    it("should leave the segment under the pointer to the chart's own emphasis instead of emphasising it again", () => {
        // Arrange
        host.attachTo(elementOfSize(800, 600))
        fireChartEvent("mouseover", { data: { name: "/root/src" } })
        stubbedChart.dispatchAction.mockClear()

        // Act
        host.highlight("/root/src")

        // Assert
        expect(stubbedChart.dispatchAction).not.toHaveBeenCalled()
    })

    it("should draw the option and keep the highlighted folder highlighted", () => {
        // Arrange
        host.attachTo(elementOfSize(800, 600))
        host.highlight("/root/src")
        stubbedChart.dispatchAction.mockClear()

        // Act
        host.render(SOME_OPTION)

        // Assert
        expect(stubbedChart.setOption).toHaveBeenCalledWith(SOME_OPTION)
        expect(stubbedChart.dispatchAction).toHaveBeenCalledWith({ type: "highlight", seriesIndex: 0, name: "/root/src" })
    })

    it("should emphasise a hovered path again after a redraw replaced the segment that was under the pointer", () => {
        // Arrange
        host.attachTo(elementOfSize(800, 600))
        fireChartEvent("mouseover", { data: { name: "/root/src" } })
        host.render(SOME_OPTION)
        stubbedChart.dispatchAction.mockClear()

        // Act
        host.highlight("/root/src")

        // Assert
        expect(stubbedChart.dispatchAction).toHaveBeenCalledWith({ type: "highlight", seriesIndex: 0, name: "/root/src" })
    })

    it("should let go of the hovered segment when a redraw replaces the rings under the pointer", () => {
        // Arrange
        host.attachTo(elementOfSize(800, 600))
        fireChartEvent("mouseover", { data: { name: "/root/src" } })

        // Act
        host.render(SOME_OPTION)

        // Assert
        expect(handlers.onNodeHovered).toHaveBeenLastCalledWith(null)
    })

    it("should keep the hovered segment when a redraw draws the same segments again", () => {
        // Arrange
        host.attachTo(elementOfSize(800, 600))
        fireChartEvent("mouseover", { data: { name: "/root/src" } })

        // Act
        host.render(SOME_OPTION, { keepsSegments: true })

        // Assert
        expect(handlers.onNodeHovered).toHaveBeenLastCalledWith("/root/src")
    })

    it("should let go of the hovered segment when it is disposed before the pointer left", () => {
        // Arrange
        jest.useFakeTimers()
        host.attachTo(elementOfSize(800, 600))
        fireChartEvent("mouseover", { data: { name: "/root/src" } })
        fireChartEvent("mouseout")

        // Act
        host.dispose()

        // Assert
        expect(handlers.onNodeHovered).toHaveBeenLastCalledWith(null)
    })

    it("should mark the chart busy while it draws and settled once the chart reports it finished", () => {
        // Arrange
        const container = elementOfSize(800, 600)
        host.attachTo(container)

        // Act
        host.render(SOME_OPTION)
        const busyWhileDrawing = container.getAttribute("aria-busy")
        fireChartEvent("finished")

        // Assert
        expect(busyWhileDrawing).toBe("true")
        expect(container.getAttribute("aria-busy")).toBe("false")
    })

    it("should only take the highlight away when nothing is hovered", () => {
        // Arrange
        host.attachTo(elementOfSize(800, 600))

        // Act
        host.highlight(null)

        // Assert
        expect(stubbedChart.dispatchAction).toHaveBeenCalledTimes(1)
        expect(stubbedChart.dispatchAction).toHaveBeenCalledWith({ type: "downplay", seriesIndex: 0 })
    })

    it("should do nothing before a container was attached", () => {
        // Act
        host.render(SOME_OPTION)
        host.highlight("/root")

        // Assert
        expect(stubbedChart.setOption).not.toHaveBeenCalled()
        expect(stubbedChart.dispatchAction).not.toHaveBeenCalled()
    })

    it("should release the chart, its registration, the size watch and the menu suppression when disposed", () => {
        // Arrange
        const container = elementOfSize(800, 600)
        host.attachTo(container)
        const browserMenu = new MouseEvent("contextmenu", { cancelable: true })

        // Act
        host.dispose()
        container.dispatchEvent(browserMenu)

        // Assert
        expect(stubbedChart.dispose).toHaveBeenCalled()
        expect(registry.current()).toBeNull()
        expect(resizeObserverDisconnect).toHaveBeenCalled()
        expect(browserMenu.defaultPrevented).toBe(false)
    })

    it("should report a segment left only once when it is disposed while the grace period runs", () => {
        // Arrange
        jest.useFakeTimers()
        host.attachTo(elementOfSize(800, 600))
        fireChartEvent("mouseover", { data: { name: "/root/src" } })
        fireChartEvent("mouseout")

        // Act
        host.dispose()
        jest.advanceTimersByTime(POINTER_LEAVE_GRACE_MS)

        // Assert
        expect(jest.mocked(handlers.onNodeHovered).mock.calls.filter(([path]) => path === null)).toHaveLength(1)
    })
})
