import { EXPLORER_DEFAULT_WIDTH, EXPLORER_MAX_WIDTH, EXPLORER_MIN_WIDTH, ExplorerWidthService } from "./explorerWidth.service"

describe("ExplorerWidthService", () => {
    let service: ExplorerWidthService

    beforeEach(() => {
        service = new ExplorerWidthService()
    })

    it("should start at the default width", () => {
        // Arrange & Act & Assert
        expect(service.width()).toBe(EXPLORER_DEFAULT_WIDTH)
    })

    it("should update the width within bounds", () => {
        // Arrange
        const target = 420

        // Act
        service.setWidth(target)

        // Assert
        expect(service.width()).toBe(target)
    })

    it("should clamp the width to the minimum", () => {
        // Arrange & Act
        service.setWidth(10)

        // Assert
        expect(service.width()).toBe(EXPLORER_MIN_WIDTH)
    })

    it("should clamp the width to the maximum", () => {
        // Arrange & Act
        service.setWidth(9000)

        // Assert
        expect(service.width()).toBe(EXPLORER_MAX_WIDTH)
    })

    it("should reset back to the default width", () => {
        // Arrange
        service.setWidth(500)

        // Act
        service.reset()

        // Assert
        expect(service.width()).toBe(EXPLORER_DEFAULT_WIDTH)
    })
})
