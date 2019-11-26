import { margin } from "./margin.reducer"
import { MarginAction, setMargin } from "./margin.actions"

describe("margin", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = margin(undefined, {} as MarginAction)

			expect(result).toEqual(null)
		})
	})

	describe("Action: SET_MARGIN", () => {
		it("should set new margin", () => {
			const result = margin(null, setMargin(42))

			expect(result).toEqual(42)
		})
	})
})
