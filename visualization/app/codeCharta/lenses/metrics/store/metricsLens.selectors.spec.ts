import { FileSelectionState, FileState } from "../../../model/files/files"
import { clone } from "../../../util/clone"
import { createBlacklistMatcher } from "../../../util/blacklist/blacklistMatcher"
import { TEST_DELTA_MAP_A } from "../../../mocks/dataMocks"
import { NodeDecorator } from "../../../util/nodeDecorator"
import { UNARY_METRIC } from "../../../util/metric/unaryMetric"
import { calculateNodeMetricData } from "../../../util/metric/nodeMetricData.calculator"
import { rangeOfMetric } from "../../../util/metric/metricRange"
import { metricRangeSelector, nodeMetricDataSelector } from "./metricsLens.selectors"

describe("metricsLens selectors", () => {
    let fileState: FileState

    beforeEach(() => {
        const file = clone(TEST_DELTA_MAP_A)
        NodeDecorator.decorateMapWithPathAttribute(file)
        fileState = { file, selectedAs: FileSelectionState.Partial }
    })

    describe("nodeMetricDataSelector", () => {
        it("should project the same node metrics as calculateNodeMetricData for the visible selection", () => {
            // Arrange
            const matcher = createBlacklistMatcher([])

            // Act
            const result = nodeMetricDataSelector.projector([fileState], matcher)

            // Assert
            expect(result).toEqual([
                { maxValue: 1000, minValue: 10, name: "functions", values: [10, 100, 1000] },
                { maxValue: 100, minValue: 1, name: "mcc", values: [1, 100, 10] },
                { maxValue: 100, minValue: 30, name: "rloc", values: [100, 30, 70] },
                { maxValue: 1, minValue: 1, name: UNARY_METRIC, values: undefined }
            ])
        })

        it("should return an empty array for an empty selection", () => {
            expect(nodeMetricDataSelector.projector([], createBlacklistMatcher([]))).toEqual([])
        })
    })

    describe("metricRangeSelector / rangeOfMetric", () => {
        it("should return the values, min and max of the color metric", () => {
            // Arrange
            const nodeMetricData = calculateNodeMetricData([fileState], createBlacklistMatcher([]))
            const colorMetric = "rloc"

            // Act
            const result = metricRangeSelector.projector(nodeMetricData, colorMetric)

            // Assert
            const rloc = nodeMetricData.find(metric => metric.name === colorMetric)
            expect(result).toEqual({ values: rloc.values, minValue: rloc.minValue, maxValue: rloc.maxValue })
        })

        it("should fall back to the empty range for a missing metric", () => {
            const nodeMetricData = calculateNodeMetricData([fileState], createBlacklistMatcher([]))

            expect(rangeOfMetric(nodeMetricData, "does_not_exist")).toEqual({ values: [], minValue: 0, maxValue: 0 })
        })
    })
})
