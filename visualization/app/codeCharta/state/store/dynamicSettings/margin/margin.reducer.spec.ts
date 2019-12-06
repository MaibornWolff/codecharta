import { margin } from "./margin.reducer"
import { MarginAction, setMargin } from "./margin.actions"

describe("margin", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = margin(undefined, {} as MarginAction)

			expect(result).toBeNull()
		})
	})

	describe("Action: SET_MARGIN", () => {
		it("should set new margin", () => {
			const result = margin(21, setMargin(42))

			expect(result).toEqual(42)
		})

		it("should set default margin", () => {
			const result = margin(21, setMargin())

			expect(result).toBeNull()
		})
	})
})
