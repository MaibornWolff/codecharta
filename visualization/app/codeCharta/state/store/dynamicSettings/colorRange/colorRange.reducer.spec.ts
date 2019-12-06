import { colorRange } from "./colorRange.reducer"
import { ColorRangeAction, setColorRange } from "./colorRange.actions"

describe("colorRange", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = colorRange(undefined, {} as ColorRangeAction)

			expect(result).toEqual({ from: null, to: null })
		})
	})

	describe("Action: SET_COLOR_RANGE", () => {
		it("should set new colorRange", () => {
			const result = colorRange({ from: null, to: null }, setColorRange({ from: 33, to: 66 }))

			expect(result).toEqual({ from: 33, to: 66 })
		})

		it("should set default colorRange", () => {
			const result = colorRange({ from: 33, to: 66 }, setColorRange())

			expect(result).toEqual({ from: null, to: null })
		})
	})
})
