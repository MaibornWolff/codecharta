import { setIsEdgeMetricVisible, toggleEdgeMetricVisible } from "./isEdgeMetricVisible.actions"
import { isEdgeMetricVisible } from "./isEdgeMetricVisible.reducer"

describe("isEdgeMetricVisible", () => {
	it("should toggle state", () => {
		const result = isEdgeMetricVisible(false, toggleEdgeMetricVisible())
		const toggledResult = isEdgeMetricVisible(result, toggleEdgeMetricVisible())

		expect(toggledResult).toBe(!result)
	})

	it("should set state", () => {
		const result = isEdgeMetricVisible(false, setIsEdgeMetricVisible({ value: true }))

		expect(result).toBe(true)
	})
})
