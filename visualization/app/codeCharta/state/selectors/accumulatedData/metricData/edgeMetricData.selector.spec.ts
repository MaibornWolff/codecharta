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
		const result = calculateEdgeMetricData(fileStates, [])

		expect(result.map(x => x.name)).toContain("pairingRate")
		expect(result.map(x => x.name)).toContain("otherMetric")
	})

	it("should calculate correct maximum value for edge Metrics", () => {
		const result = calculateEdgeMetricData(fileStates, [])

		expect(result.find(x => x.name === "pairingRate").maxValue).toEqual(2)
		expect(result.find(x => x.name === "otherMetric").maxValue).toEqual(1)
	})

	it("should sort the metrics after calculating them", () => {
		const result = calculateEdgeMetricData(fileStates, [])

		expect(result).toHaveLength(3)
		expect(result[0].name).toBe("avgCommits")
		expect(result[1].name).toBe("otherMetric")
		expect(result[2].name).toBe("pairingRate")
	})

	it("metrics Map should contain correct entries", () => {
		calculateEdgeMetricData(fileStates, [])

		const pairingRateMapKeys = [...nodeEdgeMetricsMap.get("pairingRate").keys()]

		expect(pairingRateMapKeys[0]).toEqual("/root/big leaf")
		expect(pairingRateMapKeys[1]).toEqual("/root/Parent Leaf/small leaf")
		expect(pairingRateMapKeys[2]).toEqual("/root/Parent Leaf/other small leaf")
	})
})
