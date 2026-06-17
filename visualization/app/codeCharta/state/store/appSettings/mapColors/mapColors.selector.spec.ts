import { AppSettings } from "../../../../codeCharta.model"
import { defaultMapColors } from "./mapColors.reducer"
import { mapColorsSelector } from "./mapColors.selector"

describe("mapColorsSelector", () => {
    it("should return mapColors unchanged when markingColors is already an array", () => {
        // Arrange
        const appSettings = { mapColors: defaultMapColors } as AppSettings

        // Act
        const mapColors = mapColorsSelector.projector(appSettings)

        // Assert
        expect(mapColors).toBe(appSettings.mapColors)
        expect(mapColors.markingColors).toEqual(defaultMapColors.markingColors)
    })

    it("should restore markingColors to a string array when a browser rehydrated it as an object", () => {
        // Arrange
        const rehydratedAsObject = { 0: "#FF1D8E", 1: "#1d8eff" } as unknown as string[]
        const appSettings = { mapColors: { ...defaultMapColors, markingColors: rehydratedAsObject } } as AppSettings

        // Act
        const mapColors = mapColorsSelector.projector(appSettings)

        // Assert
        expect(Array.isArray(mapColors.markingColors)).toBe(true)
        expect(mapColors.markingColors).toEqual(["#FF1D8E", "#1d8eff"])
    })
})
