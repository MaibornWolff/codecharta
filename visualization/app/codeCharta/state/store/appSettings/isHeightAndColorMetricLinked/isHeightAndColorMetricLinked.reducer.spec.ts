import { IsHeightAndColorMetricLinkedAction, toggleHeightAndColorMetricLink } from "./isHeightAndColorMetricLinked.actions"
import { isHeightAndColorMetricLinked } from "./isHeightAndColorMetricLinked.reducer"

describe("isHeightAndColorMetricLinked", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = isHeightAndColorMetricLinked(undefined, {} as IsHeightAndColorMetricLinkedAction)

			expect(result).toBe(false)
		})
	})

	describe("Action: TOGGLE_IS_HEIGHT_AND_COLOR_METRIC_LINKED", () => {
		it("should toggle state", () => {
			const result = isHeightAndColorMetricLinked(false, toggleHeightAndColorMetricLink())
			const toggleResult = isHeightAndColorMetricLinked(result, toggleHeightAndColorMetricLink())

			expect(result).toBe(!toggleResult)
		})
	})
})
