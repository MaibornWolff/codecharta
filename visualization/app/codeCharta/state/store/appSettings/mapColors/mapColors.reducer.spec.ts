import { mapColors } from "./mapColors.reducer"
import { defaultMapColors, MapColorsAction, setMapColors } from "./mapColors.actions"
import _ from "lodash"
import { MapColors } from "../../../../codeCharta.model"

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

		it("should set default mapColors", () => {
			const oldMapColors = { ...defaultMapColors, positive: "ABCDEF" }

			const result = mapColors(oldMapColors, setMapColors())

			expect(result).toEqual(defaultMapColors)
		})

		it("should update mapColors with partial mapColors object", () => {
			const oldMapColors = { ...defaultMapColors }

			const result = mapColors(oldMapColors, setMapColors({ positive: "ABCDEF" } as MapColors))

			expect(_.values(result)).toHaveLength(14)
			expect(result.positive).toEqual("ABCDEF")
		})
	})
})
