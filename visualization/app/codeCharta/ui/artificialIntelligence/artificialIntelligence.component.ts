import "./artificialIntelligence.component.scss"
import debounce from "lodash.debounce"
import { IRootScopeService } from "angular"
import { StoreService, StoreSubscriber } from "../../state/store.service"
import { ColorRange } from "../../codeCharta.model"
import { defaultMapColors, setMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"
import { setColorRange } from "../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { setHeightMetric } from "../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { setColorMetric } from "../../state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { setAreaMetric } from "../../state/store/dynamicSettings/areaMetric/areaMetric.actions"
import { AREA_METRIC } from "./artificialIntelligenceHelper/riskProfileHelper"
import { MetricSuggestionParameters } from "./artificialIntelligenceHelper/suspiciousMetricsHelper"
import {
	ArtificialIntelligenceControllerViewModel,
	artificialIntelligenceSelector
} from "./artificialIntelligenceHelper/selectors/artificialIntelligence.selector"

export class ArtificialIntelligenceController implements StoreSubscriber {
	viewModel: ArtificialIntelligenceControllerViewModel | undefined = {
		analyzedProgrammingLanguage: undefined,
		suspiciousMetricSuggestionLinks: [],
		unsuspiciousMetrics: [],
		riskProfile: { lowRisk: 0, moderateRisk: 0, highRisk: 0, veryHighRisk: 0 }
	}

	private debounceCalculation: () => void

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		StoreService.subscribe(this.$rootScope, this)

		this.debounceCalculation = debounce(() => {
			this.setViewModel()
		}, 10)
	}

	onStoreChanged() {
		this.debounceCalculation()
	}

	setViewModel() {
		const newViewModel = artificialIntelligenceSelector(this.storeService.getState())
		if (this.viewModel !== newViewModel) {
			this.viewModel = newViewModel
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
