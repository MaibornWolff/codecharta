import "./artificialIntelligence.component.scss"
import debounce from "lodash.debounce"
import { FilesSelectionSubscriber, FilesService } from "../../state/store/files/files.service"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { CodeMapNode, ColorRange } from "../../codeCharta.model"
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
import { AREA_METRIC } from "./ArtificialIntelligenceHelper/riskProfileHelper"
import { MetricSuggestionParameters } from "./ArtificialIntelligenceHelper/suspiciousMetricsHelper"
import {
	ArtificialIntelligenceControllerViewModel,
	artificialIntelligenceSelector
} from "./ArtificialIntelligenceHelper/artificialIntelligenceCalculationHelper"

export class ArtificialIntelligenceController
	implements FilesSelectionSubscriber, BlacklistSubscriber, ExperimentalFeaturesEnabledSubscriber
{
	viewModel: ArtificialIntelligenceControllerViewModel = {
		analyzedProgrammingLanguage: undefined,
		suspiciousMetricSuggestionLinks: [],
		unsuspiciousMetrics: [],
		riskProfile: { lowRisk: 0, moderateRisk: 0, highRisk: 0, veryHighRisk: 0 }
	}

	private aggregatedMap: CodeMapNode
	private debounceCalculation: () => void

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		FilesService.subscribe(this.$rootScope, this)
		BlacklistService.subscribe(this.$rootScope, this)
		ExperimentalFeaturesEnabledService.subscribe(this.$rootScope, this)

		this.debounceCalculation = debounce(() => {
			this.viewModel = artificialIntelligenceSelector(this.storeService.getState())
		}, 10)
	}

	onExperimentalFeaturesEnabledChanged(experimentalFeaturesEnabled: boolean) {
		if (experimentalFeaturesEnabled) {
			this.debounceCalculation()
		}
	}

	onBlacklistChanged() {
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

	applySuspiciousMetric(metric: MetricSuggestionParameters, isOutlier: boolean) {
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

export const artificialIntelligenceComponent = {
	selector: "artificialIntelligenceComponent",
	template: require("./artificialIntelligence.component.html"),
	controller: ArtificialIntelligenceController
}
