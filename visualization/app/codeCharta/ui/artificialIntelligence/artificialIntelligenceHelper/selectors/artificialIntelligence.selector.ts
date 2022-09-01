import {
	AREA_METRIC,
	aggregateRiskProfile,
	EXCLUDED_FILE_EXTENSION,
	HEIGHT_METRIC,
	RiskProfile,
	getPercentagesOfRiskProfile
} from "../riskProfileHelper"
import {
	calculateSuspiciousMetrics,
	findGoodAndBadMetrics,
	setMetricValuesByLanguage,
	MetricSuggestionParameters,
	MetricValuesByLanguage
} from "../suspiciousMetricsHelper"
import { hierarchy } from "d3-hierarchy"
import { BlacklistItem, BlacklistType, CodeMapNode, NodeType } from "../../../../codeCharta.model"
import { getMostFrequentLanguage } from "../mainProgrammingLanguageHelper"
import { isPathBlacklisted } from "../../../../util/codeMapHelper"
import { createSelector } from "../../../../state/angular-redux/createSelector"
import { blacklistSelector } from "../../../../state/store/fileSettings/blacklist/blacklist.selector"
import { experimentalFeaturesEnabledSelector } from "../../../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.selector"
import { CcState } from "../../../../state/store/store"
import { AccumulatedData, accumulatedDataSelector } from "../../../../state/selectors/accumulatedData/accumulatedData.selector"

export interface ArtificialIntelligenceControllerViewModel {
	analyzedProgrammingLanguage: string
	suspiciousMetricSuggestionLinks: MetricSuggestionParameters[]
	unsuspiciousMetrics: string[]
	untrackedMetrics: string[]
	riskProfile: RiskProfile
}

export const calculate = (
	experimentalFeaturesEnabled: boolean,
	accumulatedData: Pick<AccumulatedData, "unifiedMapNode">,
	blacklist: BlacklistItem[]
): ArtificialIntelligenceControllerViewModel | undefined => {
	if (!experimentalFeaturesEnabled) {
		return
	}

	const artificialIntelligenceViewModel: ArtificialIntelligenceControllerViewModel = {
		analyzedProgrammingLanguage: undefined,
		suspiciousMetricSuggestionLinks: [],
		unsuspiciousMetrics: [],
		untrackedMetrics: [],
		riskProfile: { lowRisk: 0, moderateRisk: 0, highRisk: 0, veryHighRisk: 0 }
	}

	const numberOfFilesByLanguage = new Map<string, number>()
	const rlocRisk = { lowRisk: 0, moderateRisk: 0, highRisk: 0, veryHighRisk: 0 }
	let totalRloc = 0
	const metricValuesByLanguage: MetricValuesByLanguage = {}

	for (const { data } of hierarchy(accumulatedData.unifiedMapNode)) {
		const fileExtension = getFileExtension(data.name)
		if (data.type === NodeType.FILE && fileExtension !== undefined && !isPathBlacklisted(data.path, blacklist, BlacklistType.exclude)) {
			const filesPerLanguage = numberOfFilesByLanguage.get(fileExtension) ?? 0
			numberOfFilesByLanguage.set(fileExtension, filesPerLanguage + 1)
			setMetricValuesByLanguage(data, metricValuesByLanguage, fileExtension)

			if (isFileValid(data, fileExtension)) {
				totalRloc += data.attributes[AREA_METRIC]
				aggregateRiskProfile(data, rlocRisk, fileExtension)
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
		artificialIntelligenceViewModel.untrackedMetrics = metricAssessmentResults.untrackedMetrics
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
	[experimentalFeaturesEnabledSelector, accumulatedDataSelector, blacklistSelector],
	calculate
)
