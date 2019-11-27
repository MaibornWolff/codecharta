import { invertHeight } from "./invertHeight.reducer"
import { InvertHeightAction, setInvertHeight } from "./invertHeight.actions"

describe("invertHeight", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = invertHeight(undefined, {} as InvertHeightAction)

			expect(result).toEqual(false)
		})
	})

	describe("Action: SET_INVERT_HEIGHT", () => {
		it("should set new invertHeight", () => {
			const result = invertHeight(false, setInvertHeight(true))

			expect(result).toEqual(true)
		})
	})
})
