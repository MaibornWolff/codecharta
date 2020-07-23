import { edgeMetricData } from "./edgeMetricData.reducer"
import { EdgeMetricDataAction, setEdgeMetricData } from "./edgeMetricData.actions"
import { EDGE_METRIC_DATA } from "../../../../util/dataMocks"

describe("edgeMetricData", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = edgeMetricData(undefined, {} as EdgeMetricDataAction)

			expect(result).toEqual([])
		})
	})

	describe("Action: SET_EDGE_METRIC_DATA", () => {
		it("should set new edgeMetricData", () => {
			const result = edgeMetricData([], setEdgeMetricData(EDGE_METRIC_DATA))

			expect(result).toEqual(EDGE_METRIC_DATA)
		})

		it("should set default edgeMetricData", () => {
			const result = edgeMetricData(EDGE_METRIC_DATA, setEdgeMetricData())

			expect(result).toEqual([])
		})
	})
})
