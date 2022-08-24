// import "./artificialIntelligence.component.scss"
// import debounce from "lodash.debounce"
// import { IRootScopeService } from "angular"
// import { StoreService, StoreSubscriber } from "../../state/store.service"
// import { ColorRange } from "../../codeCharta.model"
// import { defaultMapColors, setMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"
// import { setColorRange } from "../../state/store/dynamicSettings/colorRange/colorRange.actions"
// import { setHeightMetric } from "../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
// import { setColorMetric } from "../../state/store/dynamicSettings/colorMetric/colorMetric.actions"
// import { setAreaMetric } from "../../state/store/dynamicSettings/areaMetric/areaMetric.actions"
// import { AREA_METRIC } from "./artificialIntelligenceHelper/riskProfileHelper"
// import { MetricSuggestionParameters } from "./artificialIntelligenceHelper/suspiciousMetricsHelper"
// import {
// 	ArtificialIntelligenceControllerViewModel,
// 	artificialIntelligenceSelector
// } from "../ribbonBar/artificialIntelligence/selectors/artificialIntelligence.selector"

// export class ArtificialIntelligenceController implements StoreSubscriber {

// 	applySuspiciousMetric(metric: MetricSuggestionParameters, markOutlier: boolean) {
// 		const colorRange: ColorRange = {
// 			from: metric.from,
// 			to: metric.to
// 		}

// 		const mapColors = {
// 			positive: markOutlier ? "#ffffff" : defaultMapColors.positive,
// 			neutral: markOutlier ? "#ffffff" : defaultMapColors.neutral,
// 			negative: markOutlier ? "#A900C0" : defaultMapColors.negative
// 		}

// 		this.storeService.dispatch(setAreaMetric(AREA_METRIC))
// 		this.storeService.dispatch(setHeightMetric(metric.metric))
// 		this.storeService.dispatch(setColorMetric(metric.metric))
// 		this.storeService.dispatch(setColorRange(colorRange))
// 		this.storeService.dispatch(setMapColors(mapColors))
// 	}
// }
