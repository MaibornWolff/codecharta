import { IsEdgeMetricVisibleAction, toggleEdgeMetricVisible } from "./isEdgeMetricVisible.actions"
import { isEdgeMetricVisible } from "./isEdgeMetricVisible.reducer"

describe("isEdgeMetricVisible", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = isEdgeMetricVisible(undefined, {} as IsEdgeMetricVisibleAction)

			expect(result).toEqual(true)
		})
	})

	describe("Action: TOGGLE_IS_EDGE_METRIC_VISIBLE", () => {
		it("should toggle state", () => {
			const result = isEdgeMetricVisible(false, toggleEdgeMetricVisible())
			const toggledResult = isEdgeMetricVisible(result, toggleEdgeMetricVisible())

			expect(toggledResult).toBe(!result)
		})
	})
})
