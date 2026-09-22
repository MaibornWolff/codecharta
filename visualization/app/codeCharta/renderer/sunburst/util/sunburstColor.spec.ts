import { ColorMode } from "../../../model/codeCharta.model"
import { defaultMapColors } from "../../../stores/mapState/store/mapColors/mapColors.reducer"
import { folderColor, readableTextColor, SunburstColoring } from "./sunburstColor"

describe("folderColor", () => {
    const coloring: SunburstColoring = {
        colorMetric: "mcc",
        colorRange: { from: 10, to: 20 },
        colorMode: ColorMode.absolute,
        mapColors: defaultMapColors,
        colorMetricRange: { minValue: 0, maxValue: 100 }
    }

    it("should classify the folder's value on the map's colour range", () => {
        // Act
        const colors = [5, 15, 25].map(colorValue => folderColor({ colorValue, isFlat: false }, coloring))

        // Assert
        expect(colors).toEqual([defaultMapColors.positive, defaultMapColors.neutral, defaultMapColors.negative])
    })

    it("should use the base colour when no file below the folder carries the colour metric", () => {
        // Act
        const color = folderColor({ colorValue: undefined, isFlat: false }, coloring)

        // Assert
        expect(color).toBe(defaultMapColors.base)
    })

    it("should use the flat colour for a flattened folder", () => {
        // Act
        const color = folderColor({ colorValue: 25, isFlat: true }, coloring)

        // Assert
        expect(color).toBe(defaultMapColors.flat)
    })

    it("should colour every folder positive for the unary colour metric", () => {
        // Act
        const color = folderColor({ colorValue: 25, isFlat: false }, { ...coloring, colorMetric: "unary" })

        // Assert
        expect(color).toBe(defaultMapColors.positive)
    })
})

describe("readableTextColor", () => {
    it("should pick dark text on a light background and light text on a dark one", () => {
        // Assert
        expect(readableTextColor("#ffff00")).toBe("#1f2937")
        expect(readableTextColor("#820e0e")).toBe("#ffffff")
    })
})
