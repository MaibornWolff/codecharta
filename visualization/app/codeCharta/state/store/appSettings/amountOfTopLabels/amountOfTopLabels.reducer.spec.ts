import { amountOfTopLabels } from "./amountOfTopLabels.reducer"
import { AmountOfTopLabelsAction, setAmountOfTopLabels } from "./amountOfTopLabels.actions"

describe("amountOfTopLabels", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = amountOfTopLabels(undefined, {} as AmountOfTopLabelsAction)

			expect(result).toEqual(1)
		})
	})

	describe("Action: SET_AMOUNT_OF_TOP_LABELS", () => {
		it("should set new amountOfTopLabels", () => {
			const result = amountOfTopLabels(1, setAmountOfTopLabels(2))

			expect(result).toEqual(2)
		})

		it("should set default amountOfTopLabels", () => {
			const result = amountOfTopLabels(2, setAmountOfTopLabels())

			expect(result).toEqual(1)
		})
	})
})
