import { measureGlyphsIn } from "./textMeasure"

describe("measureGlyphsIn", () => {
    it("should measure a glyph in the given font", () => {
        // Arrange
        const measure = measureGlyphsIn("bold", 11)

        // Act
        const width = measure("m")

        // Assert
        expect(width).toBeGreaterThan(0)
    })

    it("should answer a glyph it measured before from memory", () => {
        // Arrange
        const measure = measureGlyphsIn("normal", 11)
        const measureText = jest.spyOn(CanvasRenderingContext2D.prototype, "measureText")
        measure("q")
        measureText.mockClear()

        // Act
        measure("q")

        // Assert
        expect(measureText).not.toHaveBeenCalled()
    })
})
