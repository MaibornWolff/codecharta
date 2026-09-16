import {
    BAR_GAP_PX,
    BOTTOM_BAR_HEIGHT_CSS_VARIABLE,
    bottomBarsInsetInPixels,
    DEFAULT_BOTTOM_BAR_HEIGHT_PX,
    DEFAULT_FILE_EXTENSION_BAR_HEIGHT_PX,
    FILE_EXTENSION_BAR_HEIGHT_CSS_VARIABLE,
    METRICS_BAR_HEIGHT_CSS_VARIABLE
} from "./barLayout"

describe("bottomBarsInsetInPixels", () => {
    let element: HTMLElement

    beforeEach(() => {
        element = document.createElement("div")
        document.body.append(element)
    })

    afterEach(() => {
        element.remove()
    })

    it("should add the metrics bar and its gap to the always present bars", () => {
        // Arrange
        element.style.setProperty(BOTTOM_BAR_HEIGHT_CSS_VARIABLE, "32px")
        element.style.setProperty(FILE_EXTENSION_BAR_HEIGHT_CSS_VARIABLE, "17px")
        element.style.setProperty(METRICS_BAR_HEIGHT_CSS_VARIABLE, "108px")

        // Act
        const inset = bottomBarsInsetInPixels(element)

        // Assert
        expect(inset).toBe(32 + 17 + BAR_GAP_PX + 108)
    })

    it("should leave out the gap when no metrics bar is shown", () => {
        // Arrange
        element.style.setProperty(BOTTOM_BAR_HEIGHT_CSS_VARIABLE, "32px")
        element.style.setProperty(FILE_EXTENSION_BAR_HEIGHT_CSS_VARIABLE, "0px")

        // Act
        const inset = bottomBarsInsetInPixels(element)

        // Assert
        expect(inset).toBe(32)
    })

    it("should fall back to the default bar heights when nothing was published", () => {
        // Arrange & Act
        const inset = bottomBarsInsetInPixels(element)

        // Assert
        expect(inset).toBe(DEFAULT_BOTTOM_BAR_HEIGHT_PX + DEFAULT_FILE_EXTENSION_BAR_HEIGHT_PX)
    })
})
