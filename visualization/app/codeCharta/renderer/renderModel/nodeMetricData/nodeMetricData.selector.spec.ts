import { TEST_DELTA_MAP_A } from "../../../mocks/dataMocks"
import { CCFile, MetricRule } from "../../../model/codeCharta.model"
import { createBlacklistMatcher } from "../../../util/blacklist/blacklistMatcher"
import { clone } from "../../../util/clone"
import { rangeOfMetric } from "../../../util/metric/metricRange"
import { calculateNodeMetricData } from "../../../util/metric/nodeMetricData.calculator"
import { UNARY_METRIC } from "../../../util/metric/unaryMetric"
import { NodeDecorator } from "../../../util/nodeDecorator"
import { metricRangeSelector, nodeMetricDataSelector } from "./nodeMetricData.selector"

describe("derived nodeMetricData selectors", () => {
    let structureTree: CCFile

    beforeEach(() => {
        structureTree = clone(TEST_DELTA_MAP_A)
        NodeDecorator.decorateMapWithPathAttribute(structureTree)
    })

    describe("nodeMetricDataSelector", () => {
        it("should project the same node metrics as calculateNodeMetricData for the visible selection", () => {
            // Arrange
            const matcher = createBlacklistMatcher([])

            // Act
            const result = nodeMetricDataSelector.projector(structureTree, matcher, [])

            // Assert
            expect(result).toEqual([
                { maxValue: 1000, minValue: 10, name: "functions", values: [10, 100, 1000] },
                { maxValue: 100, minValue: 1, name: "mcc", values: [1, 100, 10] },
                { maxValue: 100, minValue: 30, name: "rloc", values: [100, 30, 70] },
                { maxValue: 1, minValue: 1, name: UNARY_METRIC, values: [] }
            ])
        })

        it("should narrow the range by a metric rule", () => {
            // Arrange
            const excludeBigLeaf = { id: "rule", metric: "rloc", operator: "gt", value: 90, type: "exclude" } as MetricRule

            // Act
            const result = nodeMetricDataSelector.projector(structureTree, createBlacklistMatcher([]), [excludeBigLeaf])

            // Assert
            expect(result.find(metric => metric.name === "rloc")).toEqual({ maxValue: 70, minValue: 30, name: "rloc", values: [30, 70] })
        })

        it("should return an empty array for an empty selection", () => {
            expect(nodeMetricDataSelector.projector(undefined, createBlacklistMatcher([]), [])).toEqual([])
        })
    })

    describe("metricRangeSelector / rangeOfMetric", () => {
        it("should return the values, min and max of the color metric", () => {
            // Arrange
            const nodeMetricData = calculateNodeMetricData(structureTree.map, createBlacklistMatcher([]))
            const colorMetric = "rloc"

            // Act
            const result = metricRangeSelector.projector(nodeMetricData, colorMetric)

            // Assert
            const rloc = nodeMetricData.find(metric => metric.name === colorMetric)
            expect(result).toEqual({ values: rloc.values, minValue: rloc.minValue, maxValue: rloc.maxValue })
        })

        it("should fall back to the empty range for a missing metric", () => {
            const nodeMetricData = calculateNodeMetricData(structureTree.map, createBlacklistMatcher([]))

            expect(rangeOfMetric(nodeMetricData, "does_not_exist")).toEqual({ values: [], minValue: 0, maxValue: 0 })
        })
    })

    // Slice 7 P0-1 parity: after lifting the blacklist filter into these derived selectors, the
    // parameterized rangeOf path must value-equal the composed metricRangeSelector — and both must
    // equal calculateNodeMetricData ∘ rangeOfMetric with the SAME blacklist matcher (so the filter
    // lift changed WHERE the blacklist is read, not WHAT range is emitted). Guards the deletion of
    // the old lens-side read.
    describe("rangeOf parity (blacklist lift)", () => {
        it.each([[[]], [["/root/BigLeaf"]]])("should equal calculateNodeMetricData ∘ rangeOfMetric for blacklist %j", blacklist => {
            // Arrange
            const matcher = createBlacklistMatcher(blacklist.map(path => ({ path, type: "flatten" as const })))
            const colorMetric = "rloc"

            // Act
            const derivedNodeMetricData = nodeMetricDataSelector.projector(structureTree, matcher, [])
            const derivedRange = metricRangeSelector.projector(derivedNodeMetricData, colorMetric)

            // Assert — value-equal to the pure-primitive composition over the same matcher
            const expectedNodeMetricData = calculateNodeMetricData(structureTree.map, matcher)
            expect(derivedNodeMetricData).toEqual(expectedNodeMetricData)
            expect(derivedRange).toEqual(rangeOfMetric(expectedNodeMetricData, colorMetric))
        })
    })
})
