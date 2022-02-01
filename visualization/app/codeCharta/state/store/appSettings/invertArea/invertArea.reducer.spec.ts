import { invertArea } from "./invertArea.reducer"
import { InvertAreaAction, setInvertArea } from "./invertArea.actions"

describe("invertArea", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = invertArea(undefined, {} as InvertAreaAction)

			expect(result).toBeFalsy()
		})
	})

	describe("Action: SET_INVERT_AREA", () => {
		it("should set new invertArea", () => {
			const result = invertArea(false, setInvertArea(true))

			expect(result).toBeTruthy()
		})

		it("should set default invertArea", () => {
			const result = invertArea(true, setInvertArea())

			expect(result).toBeFalsy()
		})
	})
})
