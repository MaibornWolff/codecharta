import { invertColorRange } from "./invertColorRange.reducer"
import { InvertColorRangeAction, setInvertColorRange } from "./invertColorRange.actions"

describe("invertColorRange", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = invertColorRange(undefined, {} as InvertColorRangeAction)

			expect(result).toEqual(false)
		})
	})

	describe("Action: SET_INVERT_COLOR_RANGE", () => {
		it("should set new invertColorRange", () => {
			const result = invertColorRange(false, setInvertColorRange(true))

			expect(result).toEqual(true)
		})
	})
})
