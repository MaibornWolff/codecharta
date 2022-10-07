import {
	IsColorMetricLinkedToHeightMetricAction,
	setIsColorMetricLinkedToHeightMetricAction,
	toggleIsColorMetricLinkedToHeightMetric
} from "./isColorMetricLinkedToHeightMetric.actions"
import { isColorMetricLinkedToHeightMetric } from "./isColorMetricLinkedToHeightMetric.reducer"

describe("isColorMetricLinkedToHeightMetric", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = isColorMetricLinkedToHeightMetric(undefined, {} as IsColorMetricLinkedToHeightMetricAction)

			expect(result).toBe(false)
		})
	})

	describe("Action: TOGGLE_IS_COLOR_METRIC_LINKED_TO_HEIGHT_METRIC", () => {
		it("should toggle state", () => {
			const result = isColorMetricLinkedToHeightMetric(false, toggleIsColorMetricLinkedToHeightMetric())
			const toggleResult = isColorMetricLinkedToHeightMetric(result, toggleIsColorMetricLinkedToHeightMetric())

			expect(result).toBe(!toggleResult)
		})
	})

	describe("Action: SET_IS_COLOR_METRIC_LINKED_TO_HEIGHT_METRIC", () => {
		it("should set new isColorMetricLinkedToHeightMetric state", () => {
			const isLinked = isColorMetricLinkedToHeightMetric(false, setIsColorMetricLinkedToHeightMetricAction(true))
			const isNotLinked = isColorMetricLinkedToHeightMetric(isLinked, setIsColorMetricLinkedToHeightMetricAction(false))

			expect(isLinked).not.toBe(isNotLinked)
		})
	})
})
