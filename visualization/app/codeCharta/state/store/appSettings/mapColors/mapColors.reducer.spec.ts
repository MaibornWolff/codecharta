import { defaultMapColors, mapColors } from "./mapColors.reducer"
import { invertColorRange, invertDeltaColors, setMapColors } from "./mapColors.actions"

describe("mapColors", () => {
    it("should set new mapColors", () => {
        const newMapColors = { ...defaultMapColors, positive: "ABCDEF" }

        const result = mapColors(defaultMapColors, setMapColors({ value: newMapColors }))

        expect(result).toEqual(newMapColors)
    })

    it("should update mapColors with partial mapColors object", () => {
        const oldMapColors = { ...defaultMapColors }

        const result = mapColors(oldMapColors, setMapColors({ value: { positive: "ABCDEF" } }))

        expect(Object.values(result)).toHaveLength(14)
        expect(result.positive).toEqual("ABCDEF")
    })

    it("should invert color range and track the inversion flag", () => {
        const oldMapColors = { ...defaultMapColors }
        const result = mapColors(oldMapColors, invertColorRange())
        expect(result.positive).toBe(oldMapColors.negative)
        expect(result.negative).toBe(oldMapColors.positive)
        expect(result.isColorRangeInverted).toBe(true)
    })

    it("should clear the inversion flag when inverting twice", () => {
        const once = mapColors({ ...defaultMapColors }, invertColorRange())
        const twice = mapColors(once, invertColorRange())
        expect(twice.isColorRangeInverted).toBe(false)
        expect(twice.positive).toBe(defaultMapColors.positive)
    })

    it("should keep the inversion flag when a color is customized afterwards", () => {
        const inverted = mapColors({ ...defaultMapColors }, invertColorRange())
        const customized = mapColors(inverted, setMapColors({ value: { positive: "#123456" } }))
        expect(customized.isColorRangeInverted).toBe(true)
    })

    it("should invert delta colors and track the inversion flag", () => {
        const oldMapColors = { ...defaultMapColors }
        const result = mapColors(oldMapColors, invertDeltaColors())
        expect(result.positiveDelta).toBe(oldMapColors.negativeDelta)
        expect(result.negativeDelta).toBe(oldMapColors.positiveDelta)
        expect(result.areDeltaColorsInverted).toBe(true)
    })
})
