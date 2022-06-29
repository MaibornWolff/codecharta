import { mapColors } from "./mapColors.reducer"
import { defaultMapColors, invertColorRange, invertDeltaColors, MapColorsAction, setMapColors } from "./mapColors.actions"
import { MapColors } from "../../../../codeCharta.model"

describe("mapColors", () => {
	it("should initialize the default state", () => {
		const result = mapColors(undefined, {} as MapColorsAction)

		expect(result).toEqual(defaultMapColors)
	})

	it("should set new mapColors", () => {
		const newMapColors = { ...defaultMapColors, positive: "ABCDEF" }

		const result = mapColors(defaultMapColors, setMapColors(newMapColors))

		expect(result).toEqual(newMapColors)
	})

	it("should update mapColors with partial mapColors object", () => {
		const oldMapColors = { ...defaultMapColors }

		const result = mapColors(oldMapColors, setMapColors({ positive: "ABCDEF" } as MapColors))

		expect(Object.values(result)).toHaveLength(12)
		expect(result.positive).toEqual("ABCDEF")
	})

	it("should invert color range", () => {
		const oldMapColors = { ...defaultMapColors }
		const result = mapColors(oldMapColors, invertColorRange())
		expect(result.positive).toBe(oldMapColors.negative)
		expect(result.negative).toBe(oldMapColors.positive)
	})

	it("should invert delta colors", () => {
		const oldMapColors = { ...defaultMapColors }
		const result = mapColors(oldMapColors, invertDeltaColors())
		expect(result.positiveDelta).toBe(oldMapColors.negativeDelta)
		expect(result.negativeDelta).toBe(oldMapColors.positiveDelta)
	})
})
