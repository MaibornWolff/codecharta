import { calculateEdgeMetricData } from "./edgeMetricData.calculator"
import { FILE_STATES, VALID_NODE_WITH_PATH } from "../../../../util/dataMocks"
import { FileState } from "../../../../model/files/files"
import { clone } from "../../../../util/clone"

describe("edgeMetricDataCalculator", () => {
	let fileStates: FileState[]

	beforeEach(() => {
		fileStates = clone(FILE_STATES)
		fileStates[0].file.map = clone(VALID_NODE_WITH_PATH)
	})

	it("should create correct edge Metrics", () => {
		const { edgeMetricData } = calculateEdgeMetricData(fileStates, [])

		expect(edgeMetricData.map(x => x.name)).toContain("pairingRate")
		expect(edgeMetricData.map(x => x.name)).toContain("otherMetric")
	})

	it("should calculate correct maximum value for edge Metrics", () => {
		const { edgeMetricData } = calculateEdgeMetricData(fileStates, [])

		expect(edgeMetricData.find(x => x.name === "pairingRate").maxValue).toEqual(2)
		expect(edgeMetricData.find(x => x.name === "otherMetric").maxValue).toEqual(1)
	})

	it("should sort the metrics after calculating them", () => {
		const { edgeMetricData } = calculateEdgeMetricData(fileStates, [])

		expect(edgeMetricData).toHaveLength(3)
		expect(edgeMetricData[0].name).toBe("avgCommits")
		expect(edgeMetricData[1].name).toBe("otherMetric")
		expect(edgeMetricData[2].name).toBe("pairingRate")
	})

	it("should provide nodeEdgeMetricsMap", () => {
		const { nodeEdgeMetricsMap } = calculateEdgeMetricData(fileStates, [])

		const pairingRateMapKeys = [...nodeEdgeMetricsMap.get("pairingRate").keys()]

		expect(pairingRateMapKeys[0]).toEqual("/root/big leaf")
		expect(pairingRateMapKeys[1]).toEqual("/root/Parent Leaf/small leaf")
		expect(pairingRateMapKeys[2]).toEqual("/root/Parent Leaf/other small leaf")
	})
})
