import { edgeMetricData, nodeEdgeMetricsMap } from "./edgeMetricData.reducer"
import { calculateNewEdgeMetricData, EdgeMetricDataAction, setEdgeMetricData } from "./edgeMetricData.actions"
import { EDGE_METRIC_DATA, FILE_STATES } from "../../../../util/dataMocks"
import { FileState } from "../../../../model/files/files"
import _ from "lodash"

describe("edgeMetricData", () => {
	let fileStates: FileState[]

	beforeEach(() => {
		fileStates = _.cloneDeep(FILE_STATES)
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

		it("metrics Map should be sorted entries", () => {
			edgeMetricData([], calculateNewEdgeMetricData(fileStates, []))

			const pairingRateMap = nodeEdgeMetricsMap["nodeEdgeMetricsMap"].get("pairingRate")
			expect(pairingRateMap.get("/root/Parent Leaf/small leaf")).toEqual({ incoming: 2, outgoing: 0 })
			const avgCommitsMap = nodeEdgeMetricsMap.get("avgCommits")
			expect(avgCommitsMap.get("/root/big leaf")).toEqual({ incoming: 0, outgoing: 1 })
		})
	})
})
