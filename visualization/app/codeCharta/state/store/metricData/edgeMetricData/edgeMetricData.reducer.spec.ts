import { edgeMetricData, nodeEdgeMetricsMap } from "./edgeMetricData.reducer"
import { calculateNewEdgeMetricData, EdgeMetricDataAction, setEdgeMetricData } from "./edgeMetricData.actions"
import { EDGE_METRIC_DATA, FILE_STATES, VALID_NODE_WITH_PATH } from "../../../../util/dataMocks"
import { FileState } from "../../../../model/files/files"
import _ from "lodash"

describe("edgeMetricData", () => {
	let fileStates: FileState[]

	beforeEach(() => {
		fileStates = _.cloneDeep(FILE_STATES)
		fileStates[0].file.map = _.cloneDeep(VALID_NODE_WITH_PATH)
	})

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

	describe("Action: CALCULATE_NEW_EDGE_METRIC_DATA", () => {
		it("should create correct edge Metrics", () => {
			const result = edgeMetricData([], calculateNewEdgeMetricData(fileStates, []))

			expect(result.map(x => x.name)).toContain("pairingRate")
			expect(result.map(x => x.name)).toContain("otherMetric")
		})

		it("should calculate correct maximum value for edge Metrics", () => {
			const result = edgeMetricData([], calculateNewEdgeMetricData(fileStates, []))

			expect(result.find(x => x.name === "pairingRate").maxValue).toEqual(2)
			expect(result.find(x => x.name === "otherMetric").maxValue).toEqual(1)
		})

		it("metrics Map should contain correct entries entries", () => {
			edgeMetricData([], calculateNewEdgeMetricData(fileStates, []))

			const pairingRateMapKeys = nodeEdgeMetricsMap.get("pairingRate").keys()
			expect(pairingRateMapKeys.next().value).toEqual("/root/Parent Leaf/small leaf")
			expect(pairingRateMapKeys.next().value).toEqual("/root/big leaf")
			expect(pairingRateMapKeys.next().value).toEqual("/root/Parent Leaf/other small leaf")
		})

		it("metrics map should contain sorted entries by metric name", () => {
			edgeMetricData([], calculateNewEdgeMetricData(fileStates, []))

			const keys = Array.from(nodeEdgeMetricsMap.keys())

			expect(keys).toHaveLength(4)
			expect(keys[1]).toBe("avgCommits")
			expect(keys[2]).toBe("None")
			expect(keys[3]).toBe("otherMetric")
			expect(keys[4]).toBe("pairingRate")
		})
	})
})
