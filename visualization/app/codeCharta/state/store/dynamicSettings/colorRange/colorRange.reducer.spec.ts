import { colorRange } from "./colorRange.reducer"
import { ColorRangeAction, setColorRange } from "./colorRange.actions"

describe("colorRange", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = colorRange(undefined, {} as ColorRangeAction)

			expect(result).toEqual({ from: null, to: null, min: null, max: null })
		})
	})

	describe("Action: SET_COLOR_RANGE", () => {
		it("should set new colorRange", () => {
			const result = colorRange({ from: null, to: null, min: null, max: null }, setColorRange({ from: 33, to: 66, min: 0, max: 10 }))

			expect(result).toEqual({ from: 33, to: 66, min: 0, max: 10 })
		})

		it("should set default colorRange", () => {
			const result = colorRange({ from: 33, to: 66, min: 0, max: 10 }, setColorRange())

			expect(result).toEqual({ from: null, to: null, min: null, max: null })
		})
	})
})
