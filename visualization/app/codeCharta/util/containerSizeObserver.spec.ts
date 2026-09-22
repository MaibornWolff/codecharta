import { ContainerSizeObserver } from "./containerSizeObserver"

class ResizeObserverMock {
    static latestCallback: () => void
    static disconnect = jest.fn()
    constructor(callback: () => void) {
        ResizeObserverMock.latestCallback = callback
    }
    observe() {}
    disconnect() {
        ResizeObserverMock.disconnect()
    }
}

function containerOfSize(width: number, height: number): HTMLElement {
    const container = document.createElement("div")
    Object.defineProperty(container, "clientWidth", { value: width, configurable: true })
    Object.defineProperty(container, "clientHeight", { value: height, configurable: true })
    return container
}

describe("ContainerSizeObserver", () => {
    beforeEach(() => {
        ResizeObserverMock.disconnect.mockClear()
        globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver
    })

    it("should publish the container's size as soon as it observes it", () => {
        // Arrange
        const sizeObserver = new ContainerSizeObserver()

        // Act
        sizeObserver.observe(containerOfSize(800, 600))

        // Assert
        expect(sizeObserver.size()).toEqual({ width: 800, height: 600 })
    })

    it("should publish the new size after the container was resized", () => {
        // Arrange
        const sizeObserver = new ContainerSizeObserver()
        const container = containerOfSize(800, 600)
        sizeObserver.observe(container)
        Object.defineProperty(container, "clientWidth", { value: 400, configurable: true })

        // Act
        ResizeObserverMock.latestCallback()

        // Assert
        expect(sizeObserver.size()).toEqual({ width: 400, height: 600 })
    })

    it("should keep the same size object when a resize changes nothing", () => {
        // Arrange
        const sizeObserver = new ContainerSizeObserver()
        sizeObserver.observe(containerOfSize(800, 600))
        const sizeBefore = sizeObserver.size()

        // Act
        ResizeObserverMock.latestCallback()

        // Assert
        expect(sizeObserver.size()).toBe(sizeBefore)
    })

    it("should stop watching the previous container when it observes another and when disconnected", () => {
        // Arrange
        const sizeObserver = new ContainerSizeObserver()
        sizeObserver.observe(containerOfSize(800, 600))

        // Act
        sizeObserver.observe(containerOfSize(300, 200))
        sizeObserver.disconnect()

        // Assert
        expect(ResizeObserverMock.disconnect).toHaveBeenCalledTimes(2)
    })
})
