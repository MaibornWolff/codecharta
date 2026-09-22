import * as echarts from "echarts/core"
import { SunburstChartRegistry } from "../../services/sunburstChart.registry"
import { SunburstChartHandlers, SunburstChartHost } from "./sunburstChartHost"

type EventHandler = (event: unknown) => void

const chartEventHandlers = new Map<string, EventHandler>()

const mockChart = {
    setOption: jest.fn(),
    dispatchAction: jest.fn(),
    resize: jest.fn(),
    dispose: jest.fn(),
    on: jest.fn((eventName: string, handler: EventHandler) => chartEventHandlers.set(eventName, handler))
}

jest.mock("echarts/core", () => ({
    init: jest.fn(() => mockChart),
    use: jest.fn()
}))

const SOME_OPTION = {} as never
const POINTER_LEAVE_GRACE_MS = 120

class ResizeObserverMock {
    static latestCallback: () => void
    constructor(callback: () => void) {
        ResizeObserverMock.latestCallback = callback
    }
    observe() {}
    disconnect = jest.fn()
}

function containerOfSize(width: number, height: number): HTMLElement {
    const container = document.createElement("div")
    Object.defineProperty(container, "clientWidth", { value: width, configurable: true })
    Object.defineProperty(container, "clientHeight", { value: height, configurable: true })
    return container
}

describe("SunburstChartHost", () => {
    let registry: SunburstChartRegistry
    let handlers: SunburstChartHandlers
    let host: SunburstChartHost

    beforeEach(() => {
        jest.clearAllMocks()
        chartEventHandlers.clear()
        globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver
        registry = new SunburstChartRegistry()
        handlers = {
            onFolderClicked: jest.fn(),
            onFileClicked: jest.fn(),
            onCentreClicked: jest.fn(),
            onNodeHovered: jest.fn(),
            onNodeRightClicked: jest.fn()
        }
        host = new SunburstChartHost(registry, handlers)
    })

    it("should create one chart per container and register it for screenshots", () => {
        // Arrange
        const container = containerOfSize(800, 600)

        // Act
        host.attachTo(container)
        host.attachTo(container)

        // Assert
        expect(echarts.init).toHaveBeenCalledTimes(1)
        expect(registry.current()).toBe(mockChart)
        expect(host.containerSize()).toEqual({ width: 800, height: 600 })
    })

    it("should publish the container size again after it was resized", () => {
        // Arrange
        const container = containerOfSize(800, 600)
        host.attachTo(container)
        Object.defineProperty(container, "clientWidth", { value: 400, configurable: true })

        // Act
        ResizeObserverMock.latestCallback()

        // Assert
        expect(host.containerSize()).toEqual({ width: 400, height: 600 })
    })

    it("should report a click on a ring segment as a folder click with its path", () => {
        // Arrange
        host.attachTo(containerOfSize(800, 600))

        // Act
        chartEventHandlers.get("click")({ data: { name: "/root/src", isCentre: false } })

        // Assert
        expect(handlers.onFolderClicked).toHaveBeenCalledWith("/root/src")
        expect(handlers.onCentreClicked).not.toHaveBeenCalled()
    })

    it("should report a click on the centre as a request to go up", () => {
        // Arrange
        host.attachTo(containerOfSize(800, 600))

        // Act
        chartEventHandlers.get("click")({ data: { name: "/root/src", isCentre: true } })

        // Assert
        expect(handlers.onCentreClicked).toHaveBeenCalled()
        expect(handlers.onFolderClicked).not.toHaveBeenCalled()
    })

    it("should report a click on a file as a file click, which does not drill", () => {
        // Arrange
        host.attachTo(containerOfSize(800, 600))

        // Act
        chartEventHandlers.get("click")({ data: { name: "/root/a.ts", isCentre: false, isFile: true } })

        // Assert
        expect(handlers.onFileClicked).toHaveBeenCalledWith("/root/a.ts")
        expect(handlers.onFolderClicked).not.toHaveBeenCalled()
    })

    it("should report a right click on a segment with where it happened, instead of the browser's menu", () => {
        // Arrange
        const container = containerOfSize(800, 600)
        host.attachTo(container)
        const browserMenu = new MouseEvent("contextmenu", { cancelable: true })

        // Act
        chartEventHandlers.get("contextmenu")({ data: { name: "/root/src" }, event: { event: { clientX: 12, clientY: 34 } } })
        chartEventHandlers.get("contextmenu")({ event: { event: { clientX: 1, clientY: 2 } } })
        container.dispatchEvent(browserMenu)

        // Assert
        expect(handlers.onNodeRightClicked).toHaveBeenCalledTimes(1)
        expect(handlers.onNodeRightClicked).toHaveBeenCalledWith("/root/src", 12, 34)
        expect(browserMenu.defaultPrevented).toBe(true)
    })

    it("should ignore clicks that hit no segment", () => {
        // Arrange
        host.attachTo(containerOfSize(800, 600))

        // Act
        chartEventHandlers.get("click")({})

        // Assert
        expect(handlers.onCentreClicked).not.toHaveBeenCalled()
        expect(handlers.onFolderClicked).not.toHaveBeenCalled()
    })

    it("should report hovering a segment and, a moment after the pointer left, leaving it", () => {
        // Arrange
        jest.useFakeTimers()
        host.attachTo(containerOfSize(800, 600))

        // Act
        chartEventHandlers.get("mouseover")({ data: { name: "/root/src" } })
        chartEventHandlers.get("mouseout")({})
        jest.advanceTimersByTime(POINTER_LEAVE_GRACE_MS)

        // Assert
        expect(handlers.onNodeHovered).toHaveBeenNthCalledWith(1, "/root/src")
        expect(handlers.onNodeHovered).toHaveBeenNthCalledWith(2, null)
        jest.useRealTimers()
    })

    it("should not report the gap while the pointer moves from one segment to the next", () => {
        // Arrange
        jest.useFakeTimers()
        host.attachTo(containerOfSize(800, 600))
        chartEventHandlers.get("mouseover")({ data: { name: "/root/src" } })

        // Act
        chartEventHandlers.get("mouseout")({})
        chartEventHandlers.get("mouseover")({ data: { name: "/root/test" } })
        jest.advanceTimersByTime(POINTER_LEAVE_GRACE_MS)

        // Assert
        expect(handlers.onNodeHovered).not.toHaveBeenCalledWith(null)
        expect(handlers.onNodeHovered).toHaveBeenLastCalledWith("/root/test")
        jest.useRealTimers()
    })

    it("should leave the segment under the pointer to the chart's own emphasis instead of emphasising it again", () => {
        // Arrange
        host.attachTo(containerOfSize(800, 600))
        chartEventHandlers.get("mouseover")({ data: { name: "/root/src" } })
        mockChart.dispatchAction.mockClear()

        // Act
        host.highlight("/root/src")

        // Assert
        expect(mockChart.dispatchAction).not.toHaveBeenCalled()
    })

    it("should draw the option and keep the highlighted folder highlighted", () => {
        // Arrange
        host.attachTo(containerOfSize(800, 600))
        host.highlight("/root/src")
        mockChart.dispatchAction.mockClear()

        // Act
        host.render(SOME_OPTION)

        // Assert
        expect(mockChart.setOption).toHaveBeenCalledWith(SOME_OPTION)
        expect(mockChart.dispatchAction).toHaveBeenCalledWith({ type: "highlight", seriesIndex: 0, name: "/root/src" })
    })

    it("should only take the highlight away when nothing is hovered", () => {
        // Arrange
        host.attachTo(containerOfSize(800, 600))

        // Act
        host.highlight(null)

        // Assert
        expect(mockChart.dispatchAction).toHaveBeenCalledTimes(1)
        expect(mockChart.dispatchAction).toHaveBeenCalledWith({ type: "downplay", seriesIndex: 0 })
    })

    it("should do nothing before a container was attached", () => {
        // Act
        host.render(SOME_OPTION)
        host.highlight("/root")

        // Assert
        expect(mockChart.setOption).not.toHaveBeenCalled()
        expect(mockChart.dispatchAction).not.toHaveBeenCalled()
    })

    it("should release the chart and its registration when disposed", () => {
        // Arrange
        host.attachTo(containerOfSize(800, 600))

        // Act
        host.dispose()

        // Assert
        expect(mockChart.dispose).toHaveBeenCalled()
        expect(registry.current()).toBeNull()
    })
})
