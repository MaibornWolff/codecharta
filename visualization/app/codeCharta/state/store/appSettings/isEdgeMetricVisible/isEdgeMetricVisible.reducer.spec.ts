import { IsEdgeMetricVisibleAction, setIsEdgeMetricVisible } from "./isEdgeMetricVisible.actions"
import { isEdgeMetricVisible } from "./isEdgeMetricVisible.reducer"

describe("isEdgeMetricVisible", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = isEdgeMetricVisible(undefined, {} as IsEdgeMetricVisibleAction)

			expect(result).toEqual(true)
		})
	})

	describe("Action: SET_IS_EDGE_METRIC_VISIBLE", () => {
		it("should toggle state", () => {
			const result = isEdgeMetricVisible(false, setIsEdgeMetricVisible())
			const toggledResult = isEdgeMetricVisible(result, setIsEdgeMetricVisible())

			expect(toggledResult).toBe(!result)
		})
	})
})
