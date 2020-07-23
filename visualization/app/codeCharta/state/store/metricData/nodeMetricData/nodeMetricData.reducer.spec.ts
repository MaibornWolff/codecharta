import { nodeMetricData } from "./nodeMetricData.reducer"
import { NodeMetricDataAction, setNodeMetricData } from "./nodeMetricData.actions"
import { METRIC_DATA } from "../../../../util/dataMocks"

describe("nodeMetricData", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = nodeMetricData(undefined, {} as NodeMetricDataAction)

			expect(result).toEqual([])
		})
	})

	describe("Action: SET_NODE_METRIC_DATA", () => {
		it("should set new nodeMetricData", () => {
			const result = nodeMetricData([], setNodeMetricData(METRIC_DATA))

			expect(result).toEqual(METRIC_DATA)
		})

		it("should set default nodeMetricData", () => {
			const result = nodeMetricData(METRIC_DATA, setNodeMetricData())

			expect(result).toEqual([])
		})
	})
})
