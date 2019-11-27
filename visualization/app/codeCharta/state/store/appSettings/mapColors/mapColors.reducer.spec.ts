import { defaultMapColors, mapColors } from "./mapColors.reducer"
import { MapColorsAction, setMapColors } from "./mapColors.actions"

describe("mapColors", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = mapColors(undefined, {} as MapColorsAction)

			expect(result).toEqual(defaultMapColors)
		})
	})

	describe("Action: SET_MAP_COLORS", () => {
		it("should set new mapColors", () => {
			const newMapColors = { ...defaultMapColors, positive: "ABCDEF" }

			const result = mapColors(defaultMapColors, setMapColors(newMapColors))

			expect(result).toEqual(newMapColors)
		})
	})
})
