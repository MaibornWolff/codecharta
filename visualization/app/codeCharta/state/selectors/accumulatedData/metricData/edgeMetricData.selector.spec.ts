import { calculateEdgeMetricData, nodeEdgeMetricsMap } from "./edgeMetricData.selector"
import { FILE_STATES, VALID_NODE_WITH_PATH } from "../../../../util/dataMocks"
import { FileState } from "../../../../model/files/files"
import { clone } from "../../../../util/clone"

describe("edgeMetricDataSelector", () => {
	let fileStates: FileState[]

	beforeEach(() => {
		fileStates = clone(FILE_STATES)
		fileStates[0].file.map = clone(VALID_NODE_WITH_PATH)
	})

	it("should create correct edge Metrics", () => {
		const { sortedEdgeMetricList } = calculateEdgeMetricData(fileStates, [])

		expect(sortedEdgeMetricList.map(x => x.key)).toContain("pairingRate")
		expect(sortedEdgeMetricList.map(x => x.key)).toContain("otherMetric")
	})

	it("should calculate correct maximum value for edge Metrics", () => {
		const { sortedEdgeMetricList } = calculateEdgeMetricData(fileStates, [])

		expect(sortedEdgeMetricList.find(x => x.key === "pairingRate").maxValue).toEqual(2)
		expect(sortedEdgeMetricList.find(x => x.key === "otherMetric").maxValue).toEqual(1)
	})

	it("should sort the metrics after calculating them", () => {
		const { sortedEdgeMetricList } = calculateEdgeMetricData(fileStates, [])

		expect(sortedEdgeMetricList).toHaveLength(3)
		expect(sortedEdgeMetricList[0].key).toBe("avgCommits")
		expect(sortedEdgeMetricList[1].key).toBe("otherMetric")
		expect(sortedEdgeMetricList[2].key).toBe("pairingRate")
	})

	it("should sync with deprecated public exposed metrics Map", () => {
		calculateEdgeMetricData(fileStates, [])

		const pairingRateMapKeys = [...nodeEdgeMetricsMap.get("pairingRate").keys()]

		expect(pairingRateMapKeys[0]).toEqual("/root/big leaf")
		expect(pairingRateMapKeys[1]).toEqual("/root/Parent Leaf/small leaf")
		expect(pairingRateMapKeys[2]).toEqual("/root/Parent Leaf/other small leaf")
	})

	it("should provide nodeEdgeMetricsMap", () => {
		const { nodeEdgeMetricsMap } = calculateEdgeMetricData(fileStates, [])

		const pairingRateMapKeys = [...nodeEdgeMetricsMap.get("pairingRate").keys()]

		expect(pairingRateMapKeys[0]).toEqual("/root/big leaf")
		expect(pairingRateMapKeys[1]).toEqual("/root/Parent Leaf/small leaf")
		expect(pairingRateMapKeys[2]).toEqual("/root/Parent Leaf/other small leaf")
	})
})
