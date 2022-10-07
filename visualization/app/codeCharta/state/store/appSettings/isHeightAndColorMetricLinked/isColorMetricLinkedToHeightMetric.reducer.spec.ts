import {
	IsColorMetricLinkedToHeightMetricAction,
	toggleIsColorMetricLinkedToHeightMetric
} from "./isColorMetricLinkedToHeightMetric.actions"
import { isColorMetricLinkedToHeightMetric } from "./isColorMetricLinkedToHeightMetric.reducer"

describe("isHeightAndColorMetricLinked", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = isColorMetricLinkedToHeightMetric(undefined, {} as IsColorMetricLinkedToHeightMetricAction)

			expect(result).toBe(false)
		})
	})

	describe("Action: TOGGLE_IS_HEIGHT_AND_COLOR_METRIC_LINKED", () => {
		it("should toggle state", () => {
			const result = isColorMetricLinkedToHeightMetric(false, toggleIsColorMetricLinkedToHeightMetric())
			const toggleResult = isColorMetricLinkedToHeightMetric(result, toggleIsColorMetricLinkedToHeightMetric())

			expect(result).toBe(!toggleResult)
		})
	})
})
