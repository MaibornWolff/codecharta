import { TEST_DELTA_MAP_A, TEST_DELTA_MAP_B, VALID_NODE_WITH_ROOT_UNARY } from "../../mocks/dataMocks"
import { CCFile, MetricRule } from "../../model/codeCharta.model"
import { AggregationGenerator } from "../aggregationGenerator"
import { clone } from "../clone"
import { NodeDecorator } from "../nodeDecorator"
import { createExcludeMatcher } from "../nodeRules/excludeMatcher"
import { calculateNodeMetricData } from "./nodeMetricData.calculator"
import { UNARY_METRIC } from "./unaryMetric"

const rule = (metricRule: Partial<MetricRule>): MetricRule =>
    ({ id: "rule-id", metric: "rloc", operator: "gt", value: 90, type: "exclude", ...metricRule }) as MetricRule

describe("nodeMetricDataCalculator", () => {
    let file: CCFile

    beforeEach(() => {
        file = clone(TEST_DELTA_MAP_A)
        NodeDecorator.decorateMapWithPathAttribute(file)
    })

    it("should return a sorted array of metricData sorted by name calculated from the map", () => {
        const expected = [
            { maxValue: 1000, minValue: 10, name: "functions", values: [10, 100, 1000] },
            { maxValue: 100, minValue: 1, name: "mcc", values: [1, 100, 10] },
            { maxValue: 100, minValue: 30, name: "rloc", values: [100, 30, 70] },
            { maxValue: 1, minValue: 1, name: UNARY_METRIC, values: [] }
        ]

        const result = calculateNodeMetricData(file.map, createExcludeMatcher([]))

        expect(result).toEqual(expected)
    })

    it("should ignore excluded nodes", () => {
        const expected = [
            { maxValue: 1000, minValue: 100, name: "functions", values: [100, 1000] },
            { maxValue: 100, minValue: 10, name: "mcc", values: [100, 10] },
            { maxValue: 70, minValue: 30, name: "rloc", values: [30, 70] },
            { maxValue: 1, minValue: 1, name: UNARY_METRIC, values: [] }
        ]

        const result = calculateNodeMetricData(file.map, createExcludeMatcher([{ path: "root/big leaf" }]))

        expect(result).toEqual(expected)
    })

    it("should ignore files a metric rule excludes", () => {
        // Arrange
        const excludeBigLeaf = rule({ metric: "rloc", operator: "gt", value: 90 })

        // Act
        const result = calculateNodeMetricData(file.map, createExcludeMatcher([]), [excludeBigLeaf])

        // Assert — the same range as excluding that file by path
        expect(result).toEqual(calculateNodeMetricData(file.map, createExcludeMatcher([{ path: "root/big leaf" }])))
    })

    it("should not let a flatten rule reach it at all", () => {
        // Arrange — the caller hands it only the exclude rules now, so a flatten rule never arrives
        const noRules: MetricRule[] = []

        // Act
        const result = calculateNodeMetricData(file.map, createExcludeMatcher([]), noRules)

        // Assert
        expect(result).toEqual(calculateNodeMetricData(file.map, createExcludeMatcher([])))
    })

    it("should keep a metric whose every file a metric rule excludes", () => {
        // Arrange
        const excludeEveryFile = rule({ metric: "rloc", operator: "gte", value: 0 })

        // Act
        const result = calculateNodeMetricData(file.map, createExcludeMatcher([]), [excludeEveryFile])

        // Assert — the names stay, so the rule keeps matching on the map; only their range is empty
        expect(result).toEqual([
            { maxValue: 0, minValue: 0, name: "functions", values: [] },
            { maxValue: 0, minValue: 0, name: "mcc", values: [] },
            { maxValue: 0, minValue: 0, name: "rloc", values: [] },
            { maxValue: 1, minValue: 1, name: UNARY_METRIC, values: [] }
        ])
    })

    it("should exclude a file by its aggregated path when several maps are loaded", () => {
        // Arrange — with several maps every path carries the file name, and so does the exclude rule
        const otherFile = clone(TEST_DELTA_MAP_B)
        NodeDecorator.decorateMapWithPathAttribute(otherFile)
        const aggregated = AggregationGenerator.calculateAggregationFile([{ file }, { file: otherFile }])
        const matcher = createExcludeMatcher([{ path: "/root/fileA/big leaf" }])

        // Act
        const rloc = calculateNodeMetricData(aggregated.map, matcher).find(metric => metric.name === "rloc")

        // Assert — the 100 of fileA's big leaf is gone from the range
        expect(rloc.values).not.toContain(100)
        expect(rloc.maxValue).toBe(70)
    })

    it("should always add unary metric if it's not included yet", () => {
        const result = calculateNodeMetricData(file.map, createExcludeMatcher([]))

        expect(result.filter(metric => metric.name === UNARY_METRIC)).toHaveLength(1)
    })

    it("should not add unary metric a second time if the cc.json already contains unary", () => {
        file.map = VALID_NODE_WITH_ROOT_UNARY

        const result = calculateNodeMetricData(file.map, createExcludeMatcher([]))

        expect(result.filter(metric => metric.name === UNARY_METRIC).length).toBe(1)
    })

    it("should return empty metricData when there is no map. If it would contain default metrics someone might falsely assume all parsing was already done", () => {
        const result = calculateNodeMetricData(undefined, createExcludeMatcher([]))
        expect(result.length).toBe(0)
    })
})
