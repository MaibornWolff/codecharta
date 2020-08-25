import { edgeMetricData, nodeEdgeMetricsMap } from "./edgeMetricData.reducer"
import { calculateNewEdgeMetricData, EdgeMetricDataAction, setEdgeMetricData } from "./edgeMetricData.actions"
import { EDGE_METRIC_DATA, FILE_STATES, VALID_NODE_WITH_PATH } from "../../../../util/dataMocks"
import { FileState } from "../../../../model/files/files"
import _ from "lodash"
import { EdgeMetricDataService } from "./edgeMetricData.service"

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

		it("should contain the None metric once", () => {
			const result = edgeMetricData([], calculateNewEdgeMetricData(fileStates, []))

			expect(result.filter(x => x.name === EdgeMetricDataService.NONE_METRIC)).toHaveLength(1)
		})

		it("should sort the metrics after calculating them", () => {
			const result = edgeMetricData([], calculateNewEdgeMetricData(fileStates, []))

			expect(result).toHaveLength(4)
			expect(result[0].name).toBe("avgCommits")
			expect(result[1].name).toBe("None")
			expect(result[2].name).toBe("otherMetric")
			expect(result[3].name).toBe("pairingRate")
		})

		it("metrics Map should contain correct entries", () => {
			edgeMetricData([], calculateNewEdgeMetricData(fileStates, []))

			const pairingRateMapKeys = Array.from(nodeEdgeMetricsMap.get("pairingRate").keys())

			expect(pairingRateMapKeys[0]).toEqual("/root/big leaf")
			expect(pairingRateMapKeys[1]).toEqual("/root/Parent Leaf/small leaf")
			expect(pairingRateMapKeys[2]).toEqual("/root/Parent Leaf/other small leaf")
		})
	})
})
