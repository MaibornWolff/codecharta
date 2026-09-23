import { defaultMapColors } from "../../../stores/mapState/store/mapColors/mapColors.reducer"
import { TEST_COLORING } from "../testing/sunburstChart.stub"
import { nodeColor, readableTextColor } from "./sunburstColor"

describe("nodeColor", () => {
    it("should classify a value on the map's colour range unchanged, just like a building", () => {
        // Act
        const colors = [5, 15, 25].map(colorValue => nodeColor({ colorValue, isFlat: false }, TEST_COLORING))

        // Assert
        expect(colors).toEqual([defaultMapColors.positive, defaultMapColors.neutral, defaultMapColors.negative])
    })

    it("should use the base colour for a node without a colour value", () => {
        // Act
        const color = nodeColor({ colorValue: undefined, isFlat: false }, TEST_COLORING)

        // Assert
        expect(color).toBe(defaultMapColors.base)
    })

    it("should use the flat colour for a flattened node", () => {
        // Act
        const color = nodeColor({ colorValue: 25, isFlat: true }, TEST_COLORING)

        // Assert
        expect(color).toBe(defaultMapColors.flat)
    })

    it("should colour every node positive for the unary colour metric", () => {
        // Act
        const color = nodeColor({ colorValue: 25, isFlat: false }, { ...TEST_COLORING, isUnaryMetric: true })

        // Assert
        expect(color).toBe(defaultMapColors.positive)
    })
})

describe("readableTextColor", () => {
    it("should pick dark text on a light background", () => {
        // Act
        const color = readableTextColor("#ffff00")

        // Assert
        expect(color).toBe("#1f2937")
    })

    it("should pick light text on a dark background", () => {
        // Act
        const color = readableTextColor("#820e0e")

        // Assert
        expect(color).toBe("#ffffff")
    })
})
