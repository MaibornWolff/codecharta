import { ColorMode } from "../../../model/codeCharta.model"
import { defaultMapColors } from "../../../stores/mapState/store/mapColors/mapColors.reducer"
import { nodeColor, readableTextColor, SunburstColoring } from "./sunburstColor"

describe("nodeColor", () => {
    const coloring: SunburstColoring = {
        colorMetric: "mcc",
        colorRange: { from: 10, to: 20 },
        colorMode: ColorMode.absolute,
        mapColors: defaultMapColors,
        colorMetricRange: { minValue: 0, maxValue: 100 }
    }

    it("should classify a value on the map's colour range unchanged, just like a building", () => {
        // Act
        const colors = [5, 15, 25].map(colorValue => nodeColor({ colorValue, isFlat: false }, coloring))

        // Assert
        expect(colors).toEqual([defaultMapColors.positive, defaultMapColors.neutral, defaultMapColors.negative])
    })

    it("should use the base colour for a node without a colour value", () => {
        // Act
        const color = nodeColor({ colorValue: undefined, isFlat: false }, coloring)

        // Assert
        expect(color).toBe(defaultMapColors.base)
    })

    it("should use the flat colour for a flattened node", () => {
        // Act
        const color = nodeColor({ colorValue: 25, isFlat: true }, coloring)

        // Assert
        expect(color).toBe(defaultMapColors.flat)
    })

    it("should colour every node positive for the unary colour metric", () => {
        // Act
        const color = nodeColor({ colorValue: 25, isFlat: false }, { ...coloring, colorMetric: "unary" })

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
