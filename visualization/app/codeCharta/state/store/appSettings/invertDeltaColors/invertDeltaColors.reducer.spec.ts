import { invertDeltaColors } from "./invertDeltaColors.reducer"
import { InvertDeltaColorsAction, setInvertDeltaColors } from "./invertDeltaColors.actions"

describe("invertDeltaColors", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = invertDeltaColors(undefined, {} as InvertDeltaColorsAction)

			expect(result).toEqual(false)
		})
	})

	describe("Action: SET_INVERT_DELTA_COLORS", () => {
		it("should set new invertDeltaColors", () => {
			const result = invertDeltaColors(false, setInvertDeltaColors(true))

			expect(result).toEqual(true)
		})
	})
})
