import { ContainerSizeObserver } from "./containerSizeObserver"
import { elementOfSize, reportResize, resizeObserverDisconnect, stubResizeObserver } from "./testUtils/domStubs"

describe("ContainerSizeObserver", () => {
    beforeEach(() => {
        resizeObserverDisconnect.mockClear()
        stubResizeObserver()
    })

    it("should publish the container's size as soon as it observes it", () => {
        // Arrange
        const sizeObserver = new ContainerSizeObserver()

        // Act
        sizeObserver.observe(elementOfSize(800, 600))

        // Assert
        expect(sizeObserver.size()).toEqual({ width: 800, height: 600 })
    })

    it("should publish the new size after the container was resized", () => {
        // Arrange
        const sizeObserver = new ContainerSizeObserver()
        const container = elementOfSize(800, 600)
        sizeObserver.observe(container)
        Object.defineProperty(container, "clientWidth", { value: 400, configurable: true })

        // Act
        reportResize()

        // Assert
        expect(sizeObserver.size()).toEqual({ width: 400, height: 600 })
    })

    it("should keep the same size object when a resize changes nothing", () => {
        // Arrange
        const sizeObserver = new ContainerSizeObserver()
        sizeObserver.observe(elementOfSize(800, 600))
        const sizeBefore = sizeObserver.size()

        // Act
        reportResize()

        // Assert
        expect(sizeObserver.size()).toBe(sizeBefore)
    })

    it("should stop watching the previous container when it observes another and when disconnected", () => {
        // Arrange
        const sizeObserver = new ContainerSizeObserver()
        sizeObserver.observe(elementOfSize(800, 600))

        // Act
        sizeObserver.observe(elementOfSize(300, 200))
        sizeObserver.disconnect()

        // Assert
        expect(resizeObserverDisconnect).toHaveBeenCalledTimes(2)
    })
})
