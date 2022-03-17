import { BlacklistItem, BlacklistType, CodeMapNode, ColorRange } from "../../../codeCharta.model"
import { getAssociatedMetricThresholds } from "./riskProfileHelper"
import { metricDescriptions } from "../../../util/metric/metricDescriptions"
import { isPathBlacklisted } from "../../../util/codeMapHelper"
import { pushSorted } from "../../../util/nodeDecorator"

export interface MetricValues {
	[metric: string]: number[]
}

export interface MetricValuesByLanguage {
	[language: string]: MetricValues
}

export interface MetricAssessmentResults {
	suspiciousMetrics: Map<string, ColorRange>
	unsuspiciousMetrics: string[]
	outliersThresholds: Map<string, number>
}

export interface MetricSuggestionParameters {
	metric: string
	from: number
	to: number
	isOutlier?: boolean
}

export function calculateSuspiciousMetrics(metricAssessmentResults: MetricAssessmentResults) {
	const noticeableMetricSuggestionLinks = new Map<string, MetricSuggestionParameters>()

	for (const [metricName, colorRange] of metricAssessmentResults.suspiciousMetrics) {
		noticeableMetricSuggestionLinks.set(metricName, {
			metric: metricName,
			...colorRange
		})

		const outlierThreshold = metricAssessmentResults.outliersThresholds.get(metricName)
		if (outlierThreshold > 0) {
			noticeableMetricSuggestionLinks.get(metricName).isOutlier = true
		}
	}

	return [...noticeableMetricSuggestionLinks.values()].sort(compareSuspiciousMetricSuggestionLinks)
}

export function getSortedMetricValues(node: CodeMapNode, metricValues: MetricValues, blacklist: BlacklistItem[]) {
	if (!isPathBlacklisted(node.path, blacklist, BlacklistType.exclude)) {
		for (const metricIndex of Object.keys(node.attributes)) {
			const value = node.attributes[metricIndex]
			if (value > 0) {
				if (metricValues[metricIndex] === undefined) {
					metricValues[metricIndex] = []
				}
				pushSorted(metricValues[metricIndex], node.attributes[metricIndex])
			}
		}
	}
}

export function compareSuspiciousMetricSuggestionLinks(a: MetricSuggestionParameters, b: MetricSuggestionParameters): number {
	if (a.isOutlier && !b.isOutlier) {
		return -1
	}
	if (!a.isOutlier && b.isOutlier) {
		return 1
	}
	return 0
}

export function findGoodAndBadMetrics(metricValues: MetricValuesByLanguage[], mainProgrammingLanguage: string): MetricAssessmentResults {
	const metricAssessmentResults: MetricAssessmentResults = {
		suspiciousMetrics: new Map<string, ColorRange>(),
		unsuspiciousMetrics: [],
		outliersThresholds: new Map<string, number>()
	}

	const languageSpecificMetricThresholds = getAssociatedMetricThresholds(mainProgrammingLanguage)

	for (const metricName of Object.keys(languageSpecificMetricThresholds)) {
		const valuesOfMetric = metricValues[mainProgrammingLanguage][metricName]

		if (valuesOfMetric === undefined) {
			continue
		}

		const thresholdConfig = languageSpecificMetricThresholds[metricName]
		const maxMetricValue = Math.max(...valuesOfMetric)

		if (maxMetricValue <= thresholdConfig.percentile70) {
			metricAssessmentResults.unsuspiciousMetrics.push(`${metricName} (${metricDescriptions.get(metricName)})`)
		} else if (maxMetricValue > thresholdConfig.percentile70) {
			metricAssessmentResults.suspiciousMetrics.set(metricName, {
				from: thresholdConfig.percentile70,
				to: thresholdConfig.percentile80,
				max: 0,
				min: 0
			})

			if (maxMetricValue > thresholdConfig.percentile90) {
				metricAssessmentResults.outliersThresholds.set(metricName, thresholdConfig.percentile90)
			}
		}
	}

	return metricAssessmentResults
}
