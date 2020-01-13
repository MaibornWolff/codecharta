import { dynamicMargin } from "./dynamicMargin.reducer"
import { DynamicMarginAction, setDynamicMargin } from "./dynamicMargin.actions"

describe("dynamicMargin", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = dynamicMargin(undefined, {} as DynamicMarginAction)

			expect(result).toBeTruthy()
		})
	})

	describe("Action: SET_DYNAMIC_MARGIN", () => {
		it("should set new dynamicMargin", () => {
			const result = dynamicMargin(true, setDynamicMargin(false))

			expect(result).toBeFalsy()
		})

		it("should set default dynamicMargin", () => {
			const result = dynamicMargin(false, setDynamicMargin())

			expect(result).toBeTruthy()
		})
	})
})
