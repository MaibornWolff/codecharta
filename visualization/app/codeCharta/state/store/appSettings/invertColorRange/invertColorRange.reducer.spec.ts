import { invertColorRange } from "./invertColorRange.reducer"
import { InvertColorRangeAction, setInvertColorRange } from "./invertColorRange.actions"

describe("invertColorRange", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = invertColorRange(undefined, {} as InvertColorRangeAction)

			expect(result).toBeFalsy()
		})
	})

	describe("Action: SET_INVERT_COLOR_RANGE", () => {
		it("should set new invertColorRange", () => {
			const result = invertColorRange(false, setInvertColorRange(true))

			expect(result).toBeTruthy()
		})

		it("should set default invertColorRange", () => {
			const result = invertColorRange(true, setInvertColorRange())

			expect(result).toBeFalsy()
		})
	})
})
