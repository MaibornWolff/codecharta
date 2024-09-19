import { calculateEdgeMetricData, calculateNodePath } from "./edgeMetricData.calculator"
import { FILE_STATES, FILE_STATES_TWO_FILES, VALID_NODE_WITH_PATH } from "../../../../util/dataMocks"
import { FileState } from "../../../../model/files/files"
import { clone } from "../../../../util/clone"

describe("edgeMetricDataCalculator", () => {
    let fileStates: FileState[]
    let fileStatesTwoFiles: FileState[]

    beforeEach(() => {
        fileStates = clone(FILE_STATES)
        fileStates[0].file.map = clone(VALID_NODE_WITH_PATH)

        fileStatesTwoFiles = clone(FILE_STATES_TWO_FILES)
        fileStatesTwoFiles[0].file.map = clone(VALID_NODE_WITH_PATH)
        fileStatesTwoFiles[1].file.map = clone(VALID_NODE_WITH_PATH)
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

    it("should calculate correct maximum value for edge Metrics", () => {
        const { edgeMetricData } = calculateEdgeMetricData(fileStates, [])

        expect(edgeMetricData.find(x => x.name === "pairingRate").minValue).toEqual(1)
        expect(edgeMetricData.find(x => x.name === "otherMetric").minValue).toEqual(1)
    })

    it("should calculate correct values for edge Metrics", () => {
        const { edgeMetricData } = calculateEdgeMetricData(fileStates, [])

        expect(edgeMetricData.find(x => x.name === "pairingRate").values).toEqual([1, 2, 1])
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

    it("should provide nodeEdgeMetricsMap for multiple files", () => {
        const { nodeEdgeMetricsMap } = calculateEdgeMetricData(fileStatesTwoFiles, [])

        const pairingRateMapKeys = [...nodeEdgeMetricsMap.get("pairingRate").keys()]

        expect(pairingRateMapKeys[0]).toEqual("/root/fileA/big leaf")
        expect(pairingRateMapKeys[1]).toEqual("/root/fileA/Parent Leaf/small leaf")
        expect(pairingRateMapKeys[2]).toEqual("/root/fileA/Parent Leaf/other small leaf")
        expect(pairingRateMapKeys[3]).toEqual("/root/fileB/big leaf")
        expect(pairingRateMapKeys[4]).toEqual("/root/fileB/Parent Leaf/small leaf")
        expect(pairingRateMapKeys[5]).toEqual("/root/fileB/Parent Leaf/other small leaf")
    })

    it("should calculate correct path for nodes in maps with multiple files", () => {
        expect(calculateNodePath(2, fileStates[0], "/root/Parent Leaf/small leaf")).toEqual("/root/fileA/Parent Leaf/small leaf")
    })

    it("should calculate correct path for nodes in maps with a single file", () => {
        expect(calculateNodePath(1, fileStates[0], "/root/Parent Leaf/small leaf")).toEqual("/root/Parent Leaf/small leaf")
    })
})
