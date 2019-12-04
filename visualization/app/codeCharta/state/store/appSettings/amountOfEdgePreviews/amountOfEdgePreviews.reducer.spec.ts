import { amountOfEdgePreviews } from "./amountOfEdgePreviews.reducer"
import { AmountOfEdgePreviewsAction, setAmountOfEdgePreviews, setDefaultAmountOfEdgePreviews } from "./amountOfEdgePreviews.actions"

describe("amountOfEdgePreviews", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = amountOfEdgePreviews(undefined, {} as AmountOfEdgePreviewsAction)

			expect(result).toEqual(1)
		})
	})

	describe("Action: SET_AMOUNT_OF_EDGE_PREVIEWS", () => {
		it("should set new amountOfEdgePreviews", () => {
			const result = amountOfEdgePreviews(1, setAmountOfEdgePreviews(2))

			expect(result).toEqual(2)
		})
	})

	describe("Action: SET_DEFAULT_AMOUNT_OF_EDGE_PREVIEWS", () => {
		it("should set default amountOfEdgePreviews", () => {
			const result = amountOfEdgePreviews(3, setDefaultAmountOfEdgePreviews())

			expect(result).toEqual(1)
		})
	})
})
