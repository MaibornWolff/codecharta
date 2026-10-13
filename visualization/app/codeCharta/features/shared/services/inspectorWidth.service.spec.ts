import { TestBed } from "@angular/core/testing"
import {
    INSPECTOR_DEFAULT_WIDTH,
    INSPECTOR_MAX_WIDTH,
    INSPECTOR_MIN_WIDTH,
    INSPECTOR_WIDTH_CSS_VARIABLE,
    INSPECTOR_WIDTH_KEY,
    InspectorWidthService
} from "./inspectorWidth.service"

describe("InspectorWidthService", () => {
    const publishedWidth = () => document.documentElement.style.getPropertyValue(INSPECTOR_WIDTH_CSS_VARIABLE)

    beforeEach(() => {
        localStorage.clear()
        document.documentElement.style.removeProperty(INSPECTOR_WIDTH_CSS_VARIABLE)
    })

    it("should start at the default width and publish it to the page", () => {
        // Arrange & Act
        const service = TestBed.inject(InspectorWidthService)

        // Assert
        expect(service.width()).toBe(INSPECTOR_DEFAULT_WIDTH)
        expect(publishedWidth()).toBe(`${INSPECTOR_DEFAULT_WIDTH}px`)
    })

    it("should publish and remember a new width", () => {
        // Arrange
        const service = TestBed.inject(InspectorWidthService)

        // Act
        service.setWidth(480)

        // Assert
        expect(service.width()).toBe(480)
        expect(publishedWidth()).toBe("480px")
        expect(localStorage.getItem(INSPECTOR_WIDTH_KEY)).toBe("480")
    })

    it.each([
        ["narrower than allowed", 10, INSPECTOR_MIN_WIDTH],
        ["wider than allowed", 9000, INSPECTOR_MAX_WIDTH]
    ])("should hold a width %s within the allowed widths", (_, asked, expected) => {
        // Arrange
        const service = TestBed.inject(InspectorWidthService)

        // Act
        service.setWidth(asked)

        // Assert
        expect(service.width()).toBe(expected)
    })

    it("should go back to the default width on reset", () => {
        // Arrange
        const service = TestBed.inject(InspectorWidthService)
        service.setWidth(500)

        // Act
        service.reset()

        // Assert
        expect(service.width()).toBe(INSPECTOR_DEFAULT_WIDTH)
        expect(publishedWidth()).toBe(`${INSPECTOR_DEFAULT_WIDTH}px`)
    })

    it.each([
        ["a remembered width", "500", 500],
        ["a remembered width out of bounds, held within them", "9000", INSPECTOR_MAX_WIDTH],
        ["the default for a remembered value that is no width", "wide", INSPECTOR_DEFAULT_WIDTH]
    ])("should start at %s", (_, remembered, expected) => {
        // Arrange
        localStorage.setItem(INSPECTOR_WIDTH_KEY, remembered)

        // Act
        const service = TestBed.inject(InspectorWidthService)

        // Assert
        expect(service.width()).toBe(expected)
    })
})
