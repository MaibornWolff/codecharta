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

    const SAME_AS_FILES = { minValue: 0, maxValue: 100 }

    it("should classify the folder's value on the map's colour range", () => {
        // Act
        const colors = [5, 15, 25].map(colorValue => folderColor({ colorValue, isFlat: false }, coloring, SAME_AS_FILES))

        // Assert
        expect(colors).toEqual([defaultMapColors.positive, defaultMapColors.neutral, defaultMapColors.negative])
    })

    it("should place a folder's value on the colour range by its position among the folders", () => {
        // Arrange
        const foldersSpanTenTimesTheFiles = { minValue: 0, maxValue: 1000 }

        // Act
        const colors = [50, 150, 250].map(colorValue => folderColor({ colorValue, isFlat: false }, coloring, foldersSpanTenTimesTheFiles))

        // Assert
        expect(colors).toEqual([defaultMapColors.positive, defaultMapColors.neutral, defaultMapColors.negative])
    })

    it("should treat every folder as the lowest value when all folders share one value", () => {
        // Act
        const color = folderColor({ colorValue: 7, isFlat: false }, coloring, { minValue: 7, maxValue: 7 })

        // Assert
        expect(color).toBe(defaultMapColors.positive)
    })

    it("should use the base colour when the folder has no colour value", () => {
        // Act
        const color = folderColor({ colorValue: undefined, isFlat: false }, coloring, SAME_AS_FILES)

        // Assert
        expect(color).toBe(defaultMapColors.base)
    })

    it("should use the flat colour for a flattened folder", () => {
        // Act
        const color = folderColor({ colorValue: 25, isFlat: true }, coloring, SAME_AS_FILES)

        // Assert
        expect(color).toBe(defaultMapColors.flat)
    })

    it("should colour every folder positive for the unary colour metric", () => {
        // Act
        const color = folderColor({ colorValue: 25, isFlat: false }, { ...coloring, colorMetric: "unary" }, SAME_AS_FILES)

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
