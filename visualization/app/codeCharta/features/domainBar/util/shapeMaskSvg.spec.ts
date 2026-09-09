import { shapeMaskFromSvg } from "./shapeMaskSvg"

const SQUARE = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64"/></svg>'

describe("shapeMaskFromSvg", () => {
    it("should turn an SVG into a data URI the cloud can be laid out inside", () => {
        // Arrange & Act
        const mask = shapeMaskFromSvg(SQUARE)

        // Assert
        expect(mask).toEqual({ dataUri: expect.stringContaining("data:image/svg+xml,") })
    })

    it("should take a missing size from the viewBox, so the browser does not draw the shape at its own", () => {
        // Arrange
        const withoutSize = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80"><rect width="120" height="80"/></svg>'

        // Act
        const mask = shapeMaskFromSvg(withoutSize)

        // Assert
        expect(mask).toHaveProperty("dataUri")
        expect(decodeURIComponent((mask as { dataUri: string }).dataUri)).toContain('width="120"')
        expect(decodeURIComponent((mask as { dataUri: string }).dataUri)).toContain('height="80"')
    })

    it("should refuse an SVG that states neither a size nor a viewBox", () => {
        // Arrange
        const unsized = '<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10"/></svg>'

        // Act
        const mask = shapeMaskFromSvg(unsized)

        // Assert
        expect(mask).toEqual({ rejection: expect.stringContaining("neither a size nor a viewBox") })
    })

    it("should refuse a file that is not an SVG", () => {
        // Arrange
        const notAnSvg = "<html><body>not a shape</body></html>"

        // Act
        const mask = shapeMaskFromSvg(notAnSvg)

        // Assert
        expect(mask).toEqual({ rejection: "That file is not an SVG." })
    })

    it("should refuse an SVG carrying a script", () => {
        // Arrange
        const withScript = SQUARE.replace("<rect", "<script>alert(1)</script><rect")

        // Act
        const mask = shapeMaskFromSvg(withScript)

        // Assert
        expect(mask).toEqual({ rejection: expect.stringContaining("<script>") })
    })

    it("should refuse an SVG that references another file, which would taint the canvas the mask is read from", () => {
        // Arrange
        const withExternalImage = SQUARE.replace("<rect", '<image href="https://example.com/logo.png"/><rect')

        // Act
        const mask = shapeMaskFromSvg(withExternalImage)

        // Assert
        expect(mask).toEqual({ rejection: expect.stringContaining("references another file") })
    })

    it("should keep an SVG that references only itself, which a gradient or a clip path does", () => {
        // Arrange
        const withInternalReference = SQUARE.replace("<rect", '<use href="#shape"/><rect')

        // Act
        const mask = shapeMaskFromSvg(withInternalReference)

        // Assert
        expect(mask).toHaveProperty("dataUri")
    })
})
