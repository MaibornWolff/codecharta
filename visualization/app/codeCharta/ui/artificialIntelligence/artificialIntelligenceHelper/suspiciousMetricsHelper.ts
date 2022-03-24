import { CodeMapNode, ColorRange } from "../../../codeCharta.model"
import { metricDescriptions } from "../../../util/metric/metricDescriptions"
import { getAssociatedMetricThresholds } from "./util/getMetricThresholds"

interface MetricValues {
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

export function calculateSuspiciousMetrics(metricAssessmentResults: MetricAssessmentResults): MetricSuggestionParameters[] {
	const noticeableMetricSuggestionLinks = new Map<string, MetricSuggestionParameters>()

	for (const [metricName, colorRange] of metricAssessmentResults.suspiciousMetrics) {
		noticeableMetricSuggestionLinks.set(metricName, {
			metric: metricName,
			...colorRange
		})

		if (metricAssessmentResults.outliersThresholds.has(metricName)) {
			noticeableMetricSuggestionLinks.get(metricName).isOutlier = true
		}
	}

	return [...noticeableMetricSuggestionLinks.values()].sort(compareSuspiciousMetricSuggestionLinks)
}

export function setMetricValuesByLanguage(node: CodeMapNode, metricValuesByLanguage: MetricValuesByLanguage, fileExtension: string) {
	for (const [metricName, value] of Object.entries(node.attributes)) {
		if (value === 0) {
			continue
		}

		metricValuesByLanguage[fileExtension] ??= {}
		metricValuesByLanguage[fileExtension][metricName] ??= []
		metricValuesByLanguage[fileExtension][metricName].push(value)
	}
}

function compareSuspiciousMetricSuggestionLinks(a: MetricSuggestionParameters, b: MetricSuggestionParameters): number {
	if (a.isOutlier && !b.isOutlier) {
		return -1
	}
	if (!a.isOutlier && b.isOutlier) {
		return 1
	}
	return 0
}

export function findGoodAndBadMetrics(
	metricValuesByLanguages: MetricValuesByLanguage,
	mainProgrammingLanguage: string
): MetricAssessmentResults {
	const metricAssessmentResults: MetricAssessmentResults = {
		suspiciousMetrics: new Map<string, ColorRange>(),
		unsuspiciousMetrics: [],
		outliersThresholds: new Map<string, number>()
	}

	const languageSpecificMetricThresholds = getAssociatedMetricThresholds(mainProgrammingLanguage)

	for (const metricName of Object.keys(languageSpecificMetricThresholds)) {
		const valuesOfMetric = metricValuesByLanguages[mainProgrammingLanguage]?.[metricName]
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
