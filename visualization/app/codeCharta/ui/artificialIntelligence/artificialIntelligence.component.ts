import "./artificialIntelligence.component.scss"
import debounce from "lodash.debounce"
import { FilesSelectionSubscriber, FilesService } from "../../state/store/files/files.service"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { BlacklistItem, CodeMapNode, ColorRange, NodeType } from "../../codeCharta.model"
import { hierarchy } from "d3-hierarchy"
import { defaultMapColors, setMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"
import { BlacklistService, BlacklistSubscriber } from "../../state/store/fileSettings/blacklist/blacklist.service"
import {
	ExperimentalFeaturesEnabledService,
	ExperimentalFeaturesEnabledSubscriber
} from "../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.service"
import { setColorRange } from "../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { setHeightMetric } from "../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { setColorMetric } from "../../state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { setAreaMetric } from "../../state/store/dynamicSettings/areaMetric/areaMetric.actions"
import { accumulatedDataSelector } from "../../state/selectors/accumulatedData/accumulatedData.selector"
import {
	AREA_METRIC,
	calculateRiskProfile,
	isFileValid,
	RiskProfile,
	setRiskProfile
} from "./ArtificialIntelligenceHelper/riskProfilHelper"
import {
	calculateSuspiciousMetrics,
	findGoodAndBadMetrics,
	getSortedMetricValues,
	MetricSuggestionParameters,
	MetricValues,
	MetricValuesByLanguage
} from "./ArtificialIntelligenceHelper/suspiciousMetricsHelper"
import {
	detectProgrammingLanguageByOccurrence,
	getMostFrequentLanguage
} from "./ArtificialIntelligenceHelper/MainProgrammingLanguageHelper"

interface ArtificialIntelligenceControllerViewModel {
	analyzedProgrammingLanguage: string
	suspiciousMetricSuggestionLinks: MetricSuggestionParameters[]
	unsuspiciousMetrics: string[]
	riskProfile: RiskProfile
}

export class ArtificialIntelligenceController
	implements FilesSelectionSubscriber, BlacklistSubscriber, ExperimentalFeaturesEnabledSubscriber
{
	private defaultViewModel: ArtificialIntelligenceControllerViewModel = {
		analyzedProgrammingLanguage: undefined,
		suspiciousMetricSuggestionLinks: [],
		unsuspiciousMetrics: [],
		riskProfile: { lowRisk: 0, moderateRisk: 0, highRisk: 0, veryHighRisk: 0 }
	}

	private _viewModel: ArtificialIntelligenceControllerViewModel = { ...this.defaultViewModel }
	private blacklist: BlacklistItem[] = []
	private aggregatedMap: CodeMapNode
	private debounceCalculation: () => void

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		FilesService.subscribe(this.$rootScope, this)
		BlacklistService.subscribe(this.$rootScope, this)
		ExperimentalFeaturesEnabledService.subscribe(this.$rootScope, this)

		this.debounceCalculation = debounce(() => {
			this.calculate()
		}, 10)
	}

	onExperimentalFeaturesEnabledChanged(experimentalFeaturesEnabled: boolean) {
		if (experimentalFeaturesEnabled) {
			this.debounceCalculation()
		}
	}

	applySuspiciousMetric(metric: MetricSuggestionParameters, isOutlier: boolean) {
		if (this._viewModel.suspiciousMetricSuggestionLinks.includes(metric)) {
			const mapColors = { ...this.storeService.getState().appSettings.mapColors }
			const colorRange: ColorRange = {
				from: metric.from,
				to: metric.to,
				max: 0,
				min: 0
			}

			if (metric.isOutlier === isOutlier) {
				mapColors.positive = "#ffffff"
				mapColors.neutral = "#ffffff"
				mapColors.negative = "#A900C0"
			} else {
				mapColors.positive = defaultMapColors.positive
				mapColors.neutral = defaultMapColors.neutral
				mapColors.negative = defaultMapColors.negative
			}

			this.storeService.dispatch(setAreaMetric(AREA_METRIC))
			this.storeService.dispatch(setHeightMetric(metric.metric))
			this.storeService.dispatch(setColorMetric(metric.metric))
			this.storeService.dispatch(setColorRange(colorRange))
			this.storeService.dispatch(setMapColors(mapColors))
		}
	}

	onBlacklistChanged(blacklist: BlacklistItem[]) {
		this.blacklist = blacklist
		this.aggregatedMap = accumulatedDataSelector(this.storeService.getState()).unifiedMapNode
		if (this.aggregatedMap !== undefined) {
			this.debounceCalculation()
		}
	}

	onFilesSelectionChanged() {
		this.aggregatedMap = accumulatedDataSelector(this.storeService.getState()).unifiedMapNode
		if (this.aggregatedMap !== undefined) {
			this.debounceCalculation()
		}
	}

	private calculate() {
		const { experimentalFeaturesEnabled } = this.storeService.getState().appSettings
		if (!experimentalFeaturesEnabled) {
			return
		}

		this._viewModel = { ...this.defaultViewModel }

		const languageByNumberOfFiles = new Map<string, number>()
		const rlocRisk: RiskProfile = { lowRisk: 0, moderateRisk: 0, highRisk: 0, veryHighRisk: 0 }
		let totalRloc = 0

		const metricValues: MetricValues = {}
		const metricValuesByLanguage: MetricValuesByLanguage[] = []

		for (const { data } of hierarchy(this.aggregatedMap)) {
			const fileExtension = this.getFileExtension(data.name)
			if (data.type === NodeType.FILE && fileExtension !== undefined) {
				detectProgrammingLanguageByOccurrence(languageByNumberOfFiles, fileExtension)
				getSortedMetricValues(data, metricValues, this.blacklist)
				metricValuesByLanguage[fileExtension] = metricValues

				// TODO calculate risk profile only for focused or currently visible but not excluded files.
				if (isFileValid(data, fileExtension, this.blacklist)) {
					totalRloc = calculateRiskProfile(data, totalRloc, rlocRisk, fileExtension)
				}
			}

			if (totalRloc > 0) {
				this._viewModel.riskProfile = setRiskProfile(rlocRisk)
			}
		}

		const mainProgrammingLanguage = getMostFrequentLanguage(languageByNumberOfFiles)
		this._viewModel.analyzedProgrammingLanguage = mainProgrammingLanguage.length > 0 ? mainProgrammingLanguage : undefined

		if (mainProgrammingLanguage !== undefined) {
			const metricAssessmentResults = findGoodAndBadMetrics(metricValuesByLanguage, mainProgrammingLanguage)
			this._viewModel.unsuspiciousMetrics = metricAssessmentResults.unsuspiciousMetrics
			this._viewModel.suspiciousMetricSuggestionLinks = calculateSuspiciousMetrics(metricAssessmentResults)
		}
	}

	private getFileExtension(fileName: string) {
		return fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".") + 1) : undefined
	}
}

export const artificialIntelligenceComponent = {
	selector: "artificialIntelligenceComponent",
	template: require("./artificialIntelligence.component.html"),
	controller: ArtificialIntelligenceController
}
