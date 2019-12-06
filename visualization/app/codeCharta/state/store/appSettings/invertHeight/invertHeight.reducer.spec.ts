import { invertHeight } from "./invertHeight.reducer"
import { InvertHeightAction, setInvertHeight } from "./invertHeight.actions"

describe("invertHeight", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = invertHeight(undefined, {} as InvertHeightAction)

			expect(result).toBeFalsy()
		})
	})

	describe("Action: SET_INVERT_HEIGHT", () => {
		it("should set new invertHeight", () => {
			const result = invertHeight(false, setInvertHeight(true))

			expect(result).toBeTruthy()
		})

		it("should set default invertHeight", () => {
			const result = invertHeight(true, setInvertHeight())

			expect(result).toBeFalsy()
		})
	})
})
