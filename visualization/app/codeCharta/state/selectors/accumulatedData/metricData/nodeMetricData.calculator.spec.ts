import { FileSelectionState, FileState } from "../../../../model/files/files"
import { clone } from "../../../../util/clone"
import { TEST_DELTA_MAP_A, VALID_NODE_WITH_ROOT_UNARY } from "../../../../util/dataMocks"
import { NodeDecorator } from "../../../../util/nodeDecorator"
import { UNARY_METRIC, calculateNodeMetricData } from "./nodeMetricData.calculator"

describe("nodeMetricDataCalculator", () => {
    let fileState: FileState

    beforeEach(() => {
        const file = clone(TEST_DELTA_MAP_A)
        NodeDecorator.decorateMapWithPathAttribute(file)
        fileState = {
            file,
            selectedAs: FileSelectionState.Partial
        }
    })

    it("should return a sorted array of metricData sorted by name calculated from visibleFileStates", () => {
        const expected = [
            { maxValue: 1000, minValue: 10, name: "functions", values: [10, 100, 1000] },
            { maxValue: 100, minValue: 1, name: "mcc", values: [1, 100, 10] },
            { maxValue: 100, minValue: 30, name: "rloc", values: [100, 30, 70] },
            { maxValue: 1, minValue: 1, name: UNARY_METRIC, values: undefined }
        ]

        const result = calculateNodeMetricData([fileState], [])

        expect(result).toEqual(expected)
    })

    it("should ignore blacklisted nodes", () => {
        const expected = [
            { maxValue: 1000, minValue: 100, name: "functions", values: [100, 1000] },
            { maxValue: 100, minValue: 10, name: "mcc", values: [100, 10] },
            { maxValue: 70, minValue: 30, name: "rloc", values: [30, 70] },
            { maxValue: 1, minValue: 1, name: UNARY_METRIC, values: undefined }
        ]

        const result = calculateNodeMetricData([fileState], [{ path: "root/big leaf", type: "exclude" }])

        expect(result).toEqual(expected)
    })

    it("should always add unary metric if it's not included yet", () => {
        const result = calculateNodeMetricData([fileState], [])

        expect(result.filter(x => x.name === UNARY_METRIC)).toHaveLength(1)
    })

    it("should not add unary metric a second time if the cc.json already contains unary", () => {
        fileState.file.map = VALID_NODE_WITH_ROOT_UNARY

        const result = calculateNodeMetricData([fileState], [])

        expect(result.filter(x => x.name === UNARY_METRIC).length).toBe(1)
    })

    it("should return empty metricData when there are no files selected. If it would contain default metrics someone might falsely assume all parsing was already done", () => {
        const result = calculateNodeMetricData([], [])
        expect(result.length).toBe(0)
    })
})
