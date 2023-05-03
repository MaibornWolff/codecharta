import { toggleEdgeMetricVisible } from "./isEdgeMetricVisible.actions"
import { isEdgeMetricVisible } from "./isEdgeMetricVisible.reducer"

describe("isEdgeMetricVisible", () => {
	it("should toggle state", () => {
		const result = isEdgeMetricVisible(false, toggleEdgeMetricVisible())
		const toggledResult = isEdgeMetricVisible(result, toggleEdgeMetricVisible())

		expect(toggledResult).toBe(!result)
	})
})
