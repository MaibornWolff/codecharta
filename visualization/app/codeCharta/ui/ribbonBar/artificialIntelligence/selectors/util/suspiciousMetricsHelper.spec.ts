import {
    calculateSuspiciousMetrics,
    findGoodAndBadMetrics,
    MetricAssessmentResults,
    MetricValuesByLanguage,
    setMetricValuesByLanguage
} from "./suspiciousMetricsHelper"
import { CodeMapNode, ColorRange, NodeType } from "../../../../../codeCharta.model"
import { metricThresholdsByLanguage } from "./artificialIntelligence.metricThresholds"
import { metricTitles } from "../../../../../util/metric/metricTitles"

describe("suspiciousMetricsHelper", () => {
    it("should set metrics by language when node has attributes", () => {
        const actualMetricValuesByLanguage: MetricValuesByLanguage = {}
        const nodes: CodeMapNode[] = [
            { name: "javaFile1", type: NodeType.FILE, attributes: { rloc: 1, mcc: 5 } },
            { name: "javaFile2", type: NodeType.FILE, attributes: { rloc: 10, mcc: 15 } },
            { name: "tsFile1", type: NodeType.FILE, attributes: { rloc: 20, mcc: 25 } },
            { name: "tsFile2", type: NodeType.FILE, attributes: { rloc: 30, mcc: 35 } }
        ]
        const programmingLanguages: string[] = ["java", "java", "ts", "ts"]

        for (const [index, node] of nodes.entries()) {
            setMetricValuesByLanguage(node, actualMetricValuesByLanguage, programmingLanguages[index])
        }

        expect(actualMetricValuesByLanguage).toEqual({
            java: {
                rloc: [1, 10],
                mcc: [5, 15]
            },
            ts: {
                rloc: [20, 30],
                mcc: [25, 35]
            }
        })
    })

    it("should not set metrics when node has no attributes", () => {
        const actualMetricValuesByLanguage: MetricValuesByLanguage = {}
        const nodes: CodeMapNode[] = [
            { name: "javaFile1", type: NodeType.FILE, attributes: {} },
            { name: "javaFile2", type: NodeType.FILE, attributes: {} },
            { name: "javaFile3", type: NodeType.FILE, attributes: {} },
            { name: "javaFile4", type: NodeType.FILE, attributes: {} }
        ]

        for (const node of nodes) {
            setMetricValuesByLanguage(node, actualMetricValuesByLanguage, "java")
        }

        expect(actualMetricValuesByLanguage).toEqual({})
    })

    it("should find unsuspicious metrics only of main programming language", () => {
        const metricValuesByLanguage: MetricValuesByLanguage = {
            java: { functions: [1, 10, 20, 29], rloc: [366, 554, 1001, 1002] },
            ts: { functions: [1, 10, 20, 29], rloc: [366, 554, 1001, 1002] }
        }

        const expectedColorRange: ColorRange = {
            from: metricThresholdsByLanguage.java.rloc.percentile70,
            to: metricThresholdsByLanguage.java.rloc.percentile80
        }
        const expectedMetricAssessmentResults: MetricAssessmentResults = {
            suspiciousMetrics: new Map<string, ColorRange>([["rloc", expectedColorRange]]),
            unsuspiciousMetrics: ["functions (Number of Functions)"],
            outliersThresholds: new Map<string, number>([["rloc", metricThresholdsByLanguage.java.rloc.percentile90]]),
            untrackedMetrics: []
        }

        const actualAssessmentResults: MetricAssessmentResults = findGoodAndBadMetrics(metricValuesByLanguage, "java")

        expect(actualAssessmentResults.unsuspiciousMetrics).toEqual(expectedMetricAssessmentResults.unsuspiciousMetrics)
        expect(actualAssessmentResults.suspiciousMetrics).toEqual(expectedMetricAssessmentResults.suspiciousMetrics)
        expect(actualAssessmentResults.outliersThresholds).toEqual(expectedMetricAssessmentResults.outliersThresholds)
    })

    it("should set unsuspicious metrics of main programming language", () => {
        const metricValuesByLanguage: MetricValuesByLanguage = {
            java: { complexity: [10, 20, 30, 48], rloc: [100, 200, 300, 365] },
            ts: { functions: [10, 20, 30, 48], rloc: [100, 200, 300, 365] }
        }

        const actualAssessmentResults: MetricAssessmentResults = findGoodAndBadMetrics(metricValuesByLanguage, "java")

        expect(actualAssessmentResults.unsuspiciousMetrics).toEqual([
            `complexity (${metricTitles.get("complexity")})`,
            `rloc (${metricTitles.get("rloc")})`
        ])
    })

    it("should set suspicious metrics of main programming language", () => {
        const metricValuesByLanguage: MetricValuesByLanguage = {}
        metricValuesByLanguage["java"] = { rloc: [366, 555, 1001, 1665] }
        metricValuesByLanguage["ts"] = { functions: [1, 10, 20, 29], rloc: [366, 554, 1001, 1002] }
        const expectedColorRange: ColorRange = {
            from: metricThresholdsByLanguage.java.rloc.percentile70,
            to: metricThresholdsByLanguage.java.rloc.percentile80
        }
        const expected = new Map<string, ColorRange>([["rloc", expectedColorRange]])
        const actualAssessmentResults: MetricAssessmentResults = findGoodAndBadMetrics(metricValuesByLanguage, "java")

        expect(actualAssessmentResults.suspiciousMetrics).toEqual(expected)
    })

    it("should mark metric as outlier when metric value is above percentile of 90 of main programming language", () => {
        const metricValuesByLanguage: MetricValuesByLanguage = {}
        metricValuesByLanguage["java"] = { rloc: [366, 555, 1001, 100_000] }
        metricValuesByLanguage["ts"] = { functions: [1, 10, 20, 29], rloc: [366, 554, 1001, 1002] }

        const expected = new Map<string, number>([["rloc", metricThresholdsByLanguage.java.rloc.percentile90]])
        const actualAssessmentResults: MetricAssessmentResults = findGoodAndBadMetrics(metricValuesByLanguage, "java")

        expect(actualAssessmentResults.outliersThresholds).toEqual(expected)
    })

    it("should get empty MetricAssessmentResults when no attributes are available", () => {
        const metricValuesByLanguage: MetricValuesByLanguage = {}

        const actualAssessmentResults: MetricAssessmentResults = findGoodAndBadMetrics(metricValuesByLanguage, "python")

        expect(actualAssessmentResults).toEqual({
            suspiciousMetrics: new Map<string, ColorRange>(),
            unsuspiciousMetrics: [],
            outliersThresholds: new Map<string, number>(),
            untrackedMetrics: []
        })
    })

    it("should get description of metric or else should write nothing", () => {
        const metricValuesByLanguage: MetricValuesByLanguage = {}
        metricValuesByLanguage["java"] = { rloc: [1, 1, 1, 1], cognitive_complexity: [3, 5, 1, 1] }

        const actualAssessmentResults: MetricAssessmentResults = findGoodAndBadMetrics(metricValuesByLanguage, "java")

        expect(actualAssessmentResults).toEqual({
            suspiciousMetrics: new Map<string, ColorRange>(),
            unsuspiciousMetrics: ["rloc (Real Lines of Code)", "cognitive_complexity"],
            outliersThresholds: new Map<string, number>(),
            untrackedMetrics: []
        })
    })

    it("should calculate suspicious metrics", () => {
        const colorRange: ColorRange = {
            from: 1,
            to: 10
        }
        const metricAssessmentResults: MetricAssessmentResults = {
            suspiciousMetrics: new Map([["mcc", colorRange]]),
            unsuspiciousMetrics: [],
            outliersThresholds: new Map([["mcc", 1000]]),
            untrackedMetrics: []
        }

        const actualMetricSuggestionParameter = calculateSuspiciousMetrics(metricAssessmentResults)

        expect(actualMetricSuggestionParameter).toEqual([
            {
                from: 1,
                isOutlier: true,
                outlierThreshold: 1000,
                metric: "mcc",
                to: 10
            }
        ])
    })

    it("should calculate suspicious metrics sort by outlier", () => {
        const colorRange: ColorRange = {
            from: 1,
            to: 10
        }
        const metricAssessmentResults: MetricAssessmentResults = {
            suspiciousMetrics: new Map([
                ["mcc", colorRange],
                ["loc", colorRange],
                ["functions", colorRange]
            ]),
            unsuspiciousMetrics: [],
            outliersThresholds: new Map([
                ["mcc", 1000],
                ["loc", 2000]
            ]),
            untrackedMetrics: []
        }

        const actualMetricSuggestionParameter = calculateSuspiciousMetrics(metricAssessmentResults)

        expect(actualMetricSuggestionParameter[0].metric).toBe("mcc")
        expect(actualMetricSuggestionParameter[0].isOutlier).toBe(true)
        expect(actualMetricSuggestionParameter[1].metric).toBe("loc")
        expect(actualMetricSuggestionParameter[1].isOutlier).toBe(true)
        expect(actualMetricSuggestionParameter[2].metric).toBe("functions")
        expect(actualMetricSuggestionParameter[2].isOutlier).toBeUndefined()
    })
})
