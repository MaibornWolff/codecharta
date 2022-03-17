import { calculateRiskProfile, isFileValid, RiskProfile, setRiskProfile } from "./riskProfileHelper"
import {
	calculateSuspiciousMetrics,
	findGoodAndBadMetrics,
	getSortedMetricValues,
	MetricSuggestionParameters,
	MetricValues,
	MetricValuesByLanguage
} from "./suspiciousMetricsHelper"
import { hierarchy } from "d3-hierarchy"
import { AppSettings, BlacklistItem, CodeMapNode, NodeType } from "../../../codeCharta.model"
import { detectProgrammingLanguageByOccurrence, getMostFrequentLanguage } from "./MainProgrammingLanguageHelper"

export interface ArtificialIntelligenceControllerViewModel {
	analyzedProgrammingLanguage: string
	suspiciousMetricSuggestionLinks: MetricSuggestionParameters[]
	unsuspiciousMetrics: string[]
	riskProfile: RiskProfile
}

export function calculate(
	appSettings: AppSettings,
	map: CodeMapNode,
	blacklist: BlacklistItem[]
): ArtificialIntelligenceControllerViewModel {
	if (!appSettings.experimentalFeaturesEnabled) {
		return
	}

	const artificialIntelligenceViewModel: ArtificialIntelligenceControllerViewModel = {
		analyzedProgrammingLanguage: undefined,
		suspiciousMetricSuggestionLinks: [],
		unsuspiciousMetrics: [],
		riskProfile: { lowRisk: 0, moderateRisk: 0, highRisk: 0, veryHighRisk: 0 }
	}

	const languageByNumberOfFiles = new Map<string, number>()

	const rlocRisk: RiskProfile = { lowRisk: 0, moderateRisk: 0, highRisk: 0, veryHighRisk: 0 }
	let totalRloc = 0

	const metricValues: MetricValues = {}
	const metricValuesByLanguage: MetricValuesByLanguage[] = []

	for (const { data } of hierarchy(map)) {
		const fileExtension = getFileExtension(data.name)
		if (data.type === NodeType.FILE && fileExtension !== undefined) {
			detectProgrammingLanguageByOccurrence(languageByNumberOfFiles, fileExtension)
			getSortedMetricValues(data, metricValues, blacklist)
			metricValuesByLanguage[fileExtension] = metricValues

			if (isFileValid(data, fileExtension, blacklist)) {
				totalRloc = calculateRiskProfile(data, totalRloc, rlocRisk, fileExtension)
			}
		}

		if (totalRloc > 0) {
			artificialIntelligenceViewModel.riskProfile = setRiskProfile(rlocRisk)
		}
	}

	const mainProgrammingLanguage = getMostFrequentLanguage(languageByNumberOfFiles)
	artificialIntelligenceViewModel.analyzedProgrammingLanguage = mainProgrammingLanguage.length > 0 ? mainProgrammingLanguage : undefined

	if (mainProgrammingLanguage !== undefined) {
		const metricAssessmentResults = findGoodAndBadMetrics(metricValuesByLanguage, mainProgrammingLanguage)
		artificialIntelligenceViewModel.unsuspiciousMetrics = metricAssessmentResults.unsuspiciousMetrics
		artificialIntelligenceViewModel.suspiciousMetricSuggestionLinks = calculateSuspiciousMetrics(metricAssessmentResults)
	}

	return artificialIntelligenceViewModel
}

export function getFileExtension(fileName: string) {
	return fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".") + 1) : undefined
}
