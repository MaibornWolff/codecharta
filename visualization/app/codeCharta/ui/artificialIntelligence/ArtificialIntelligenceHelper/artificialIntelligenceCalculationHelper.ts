import {
	AREA_METRIC,
	calculateRiskProfile,
	EXCLUDED_FILE_EXTENSION,
	HEIGHT_METRIC,
	RiskProfile,
	getPercentagesOfRiskProfile
} from "./riskProfileHelper"
import {
	calculateSuspiciousMetrics,
	findGoodAndBadMetrics,
	setMetricValues,
	MetricSuggestionParameters,
	MetricValues,
	MetricValuesByLanguage
} from "./suspiciousMetricsHelper"
import { hierarchy } from "d3-hierarchy"
import { BlacklistItem, BlacklistType, CodeMapNode, NodeType } from "../../../codeCharta.model"
import { getMostFrequentLanguage } from "./MainProgrammingLanguageHelper"
import { isPathBlacklisted } from "../../../util/codeMapHelper"
import { createSelector } from "../../../state/angular-redux/createSelector"
import { blacklistSelector } from "../../../state/store/fileSettings/blacklist/blacklist.selector"
import { CcState } from "../../../state/store/store"
import { unifiedMapNodeSelector } from "../../../state/selectors/accumulatedData/unifiedMapNode.selector"
import { experimentalFeaturesEnabledSelector } from "../../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.selector"

export interface ArtificialIntelligenceControllerViewModel {
	analyzedProgrammingLanguage: string
	suspiciousMetricSuggestionLinks: MetricSuggestionParameters[]
	unsuspiciousMetrics: string[]
	riskProfile: RiskProfile
}

export const calculate = (experimentalFeaturesEnabled: boolean, map: CodeMapNode, blacklist: BlacklistItem[]) => {
	if (!experimentalFeaturesEnabled) {
		return
	}

	const artificialIntelligenceViewModel: ArtificialIntelligenceControllerViewModel = {
		analyzedProgrammingLanguage: undefined,
		suspiciousMetricSuggestionLinks: [],
		unsuspiciousMetrics: [],
		riskProfile: { lowRisk: 0, moderateRisk: 0, highRisk: 0, veryHighRisk: 0 }
	}

	const numberOfFilesByLanguage = new Map<string, number>()
	const rlocRisk = { lowRisk: 0, moderateRisk: 0, highRisk: 0, veryHighRisk: 0 }
	let totalRloc = 0
	const metricValues: MetricValues = {}
	const metricValuesByLanguage: MetricValuesByLanguage[] = []

	for (const { data } of hierarchy(map)) {
		const fileExtension = getFileExtension(data.name)
		if (data.type === NodeType.FILE && fileExtension !== undefined && !isPathBlacklisted(data.path, blacklist, BlacklistType.exclude)) {
			const filesPerLanguage = numberOfFilesByLanguage.get(fileExtension) ?? 0
			numberOfFilesByLanguage.set(fileExtension, filesPerLanguage + 1)

			setMetricValues(data, metricValues)
			metricValuesByLanguage[fileExtension] = metricValues

			if (isFileValid(data, fileExtension)) {
				totalRloc += data.attributes[AREA_METRIC]
				calculateRiskProfile(data, rlocRisk, fileExtension)
			}
		}

		if (totalRloc > 0) {
			artificialIntelligenceViewModel.riskProfile = getPercentagesOfRiskProfile(rlocRisk)
		}
	}

	const mainProgrammingLanguage = getMostFrequentLanguage(numberOfFilesByLanguage)
	artificialIntelligenceViewModel.analyzedProgrammingLanguage = mainProgrammingLanguage

	if (mainProgrammingLanguage !== undefined) {
		const metricAssessmentResults = findGoodAndBadMetrics(metricValuesByLanguage, mainProgrammingLanguage)
		artificialIntelligenceViewModel.unsuspiciousMetrics = metricAssessmentResults.unsuspiciousMetrics
		artificialIntelligenceViewModel.suspiciousMetricSuggestionLinks = calculateSuspiciousMetrics(metricAssessmentResults)
	}

	return artificialIntelligenceViewModel
}

function getFileExtension(fileName: string) {
	return fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".") + 1) : undefined
}

function isFileValid(node: CodeMapNode, fileExtension: string) {
	return (
		node.attributes[HEIGHT_METRIC] !== undefined &&
		node.attributes[AREA_METRIC] !== undefined &&
		!EXCLUDED_FILE_EXTENSION.has(fileExtension)
	)
}

export const artificialIntelligenceSelector: (state: CcState) => ArtificialIntelligenceControllerViewModel = createSelector(
	[experimentalFeaturesEnabledSelector, unifiedMapNodeSelector, blacklistSelector],
	calculate
)
