import { EdgeMetricToggleAction, toggleEdgeMetric } from "./toggleEdgeMetric.actions"
import { edgeMetricToggler } from "./toggleEdgeMetric.reducer"

describe("edgeMetricToggler", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = edgeMetricToggler(undefined, {} as EdgeMetricToggleAction)

			expect(result).toEqual(false)
		})
	})

	describe("Action: TOGGLE_EDGE_METRIC", () => {
		it("should toggle state", () => {
			const result = edgeMetricToggler(false, toggleEdgeMetric(true))
			const toggledResult = edgeMetricToggler(result, toggleEdgeMetric())

			expect(toggledResult).toBe(!result)
		})
	})
})
