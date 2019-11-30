import { edgeMetric } from "./edgeMetric.reducer"
import { EdgeMetricAction, setEdgeMetric } from "./edgeMetric.actions"

describe("edgeMetric", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = edgeMetric(undefined, {} as EdgeMetricAction)

			expect(result).toBeNull()
		})
	})

	describe("Action: SET_EDGE_METRIC", () => {
		it("should set new edgeMetric", () => {
			const result = edgeMetric("mcc", setEdgeMetric("another_edge_metric"))

			expect(result).toEqual("another_edge_metric")
		})
	})
})
