import {
	calculateSuspiciousMetrics,
	findGoodAndBadMetrics,
	MetricAssessmentResults,
	MetricValues,
	MetricValuesByLanguage,
	setMetricValues
} from "./suspiciousMetricsHelper"
import { CodeMapNode, ColorRange, NodeType } from "../../../codeCharta.model"
import { metricThresholdsByLanguage } from "./artificialIntelligence.metricThresholds"
import { metricDescriptions } from "../../../util/metric/metricDescriptions"

describe("suspiciousMetricsHelper", () => {
	it("should set metrics when node has attributes", () => {
		const actualMetricValues: MetricValues = {}
		const nodes: CodeMapNode[] = [
			{ name: "javaFile1", type: NodeType.FILE, attributes: { rloc: 1, mcc: 1 } },
			{ name: "javaFile2", type: NodeType.FILE, attributes: { rloc: 10, mcc: 10 } },
			{ name: "javaFile3", type: NodeType.FILE, attributes: { statements: 100, functions: 100 } },
			{ name: "javaFile4", type: NodeType.FILE, attributes: { statements: 1000, functions: 1000 } }
		]

		for (const node of nodes) {
			setMetricValues(node, actualMetricValues)
		}

		expect(actualMetricValues).toEqual({
			rloc: [1, 10],
			mcc: [1, 10],
			statements: [100, 1000],
			functions: [100, 1000]
		})
	})

	it("should not set metrics when node has no attributes", () => {
		const actualMetricValues: MetricValues = {}
		const nodes: CodeMapNode[] = [
			{ name: "javaFile1", type: NodeType.FILE, attributes: {} },
			{ name: "javaFile2", type: NodeType.FILE, attributes: {} },
			{ name: "javaFile3", type: NodeType.FILE, attributes: {} },
			{ name: "javaFile4", type: NodeType.FILE, attributes: {} }
		]

		for (const node of nodes) {
			setMetricValues(node, actualMetricValues)
		}

		expect(actualMetricValues).toEqual({})
	})

	it("should find unsuspicious metrics only of main programming language", () => {
		const metricValuesByLanguage: MetricValuesByLanguage = {
			java: { functions: [1, 10, 20, 29], rloc: [366, 554, 1001, 1002] },
			ts: { functions: [1, 10, 20, 29], rloc: [366, 554, 1001, 1002] }
		}

		const expecteColorRange: ColorRange = {
			from: metricThresholdsByLanguage.java.rloc.percentile70,
			to: metricThresholdsByLanguage.java.rloc.percentile80,
			max: 0,
			min: 0
		}
		const expectedMetricAssessmentResults: MetricAssessmentResults = {
			suspiciousMetrics: new Map<string, ColorRange>([["rloc", expecteColorRange]]),
			unsuspiciousMetrics: ["functions (number of functions)"],
			outliersThresholds: new Map<string, number>([["rloc", metricThresholdsByLanguage.java.rloc.percentile90]])
		}

		const actualAssessmentResults: MetricAssessmentResults = findGoodAndBadMetrics(metricValuesByLanguage, "java")

		expect(actualAssessmentResults.unsuspiciousMetrics).toEqual(expectedMetricAssessmentResults.unsuspiciousMetrics)
		expect(actualAssessmentResults.suspiciousMetrics).toEqual(expectedMetricAssessmentResults.suspiciousMetrics)
		expect(actualAssessmentResults.outliersThresholds).toEqual(expectedMetricAssessmentResults.outliersThresholds)
	})

	it("should set unsuspicious metrics of main programming language", () => {
		const metricValuesByLanguage: MetricValuesByLanguage = {
			java: { mcc: [10, 20, 30, 48], rloc: [100, 200, 300, 365] },
			ts: { functions: [10, 20, 30, 48], rloc: [100, 200, 300, 365] }
		}

		const actualAssessmentResults: MetricAssessmentResults = findGoodAndBadMetrics(metricValuesByLanguage, "java")

		expect(actualAssessmentResults.unsuspiciousMetrics).toEqual([
			`mcc (${metricDescriptions.get("mcc")})`,
			`rloc (${metricDescriptions.get("rloc")})`
		])
	})

	it("should set suspicious metrics of main programming language", () => {
		const metricValuesByLanguage: MetricValuesByLanguage = {}
		metricValuesByLanguage["java"] = { rloc: [366, 555, 1001, 1665] }
		metricValuesByLanguage["ts"] = { functions: [1, 10, 20, 29], rloc: [366, 554, 1001, 1002] }
		const expectedColorRange: ColorRange = {
			from: metricThresholdsByLanguage.java.rloc.percentile70,
			to: metricThresholdsByLanguage.java.rloc.percentile80,
			max: 0,
			min: 0
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
			outliersThresholds: new Map<string, number>()
		})
	})

	it("should calculate suspicious metrics", () => {
		const colorRange: ColorRange = {
			from: 1,
			to: 10,
			max: 0,
			min: 0
		}
		const metricAssessmentResults: MetricAssessmentResults = {
			suspiciousMetrics: new Map([["mcc", colorRange]]),
			unsuspiciousMetrics: [],
			outliersThresholds: new Map([["mcc", 1000]])
		}

		const actualMetricSuggestionParameter = calculateSuspiciousMetrics(metricAssessmentResults)

		expect(actualMetricSuggestionParameter).toEqual([
			{
				from: 1,
				isOutlier: true,
				max: 0,
				metric: "mcc",
				min: 0,
				to: 10
			}
		])
	})

	it("should calculate suspicious metrics sort by outlier", () => {
		const colorRange: ColorRange = {
			from: 1,
			to: 10,
			max: 0,
			min: 0
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
			])
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
