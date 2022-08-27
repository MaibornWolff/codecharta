import { Component, Inject, Input } from "@angular/core"
import { Store } from "../../../../state/angular-redux/store"
import { defaultMapColors, setMapColors } from "../../../../state/store/appSettings/mapColors/mapColors.actions"
import { setAreaMetric } from "../../../../state/store/dynamicSettings/areaMetric/areaMetric.actions"
import { setColorMetric } from "../../../../state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { setColorRange } from "../../../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { setHeightMetric } from "../../../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { ArtificialIntelligenceData } from "../selectors/artificialIntelligence.selector"
import { AREA_METRIC } from "../selectors/util/riskProfileHelper"
import { MetricSuggestionParameters } from "../selectors/util/suspiciousMetricsHelper"

@Component({
	selector: "cc-suspicious-metrics",
	template: require("./suspiciousMetrics.component.html")
})
export class SuspiciousMetricComponent {
	@Input() data: Pick<
		ArtificialIntelligenceData,
		"analyzedProgrammingLanguage" | "unsuspiciousMetrics" | "suspiciousMetricSuggestionLinks"
	>

	constructor(@Inject(Store) private store: Store) {}

	applySuspiciousMetric(metric: MetricSuggestionParameters, markOutlier: boolean) {
		this.store.dispatch(setAreaMetric(AREA_METRIC))
		this.store.dispatch(setHeightMetric(metric.metric))
		this.store.dispatch(setColorMetric(metric.metric))
		this.store.dispatch(
			setColorRange({
				from: metric.from,
				to: metric.to
			})
		)
		this.store.dispatch(
			setMapColors({
				positive: markOutlier ? "#ffffff" : defaultMapColors.positive,
				neutral: markOutlier ? "#ffffff" : defaultMapColors.neutral,
				negative: markOutlier ? "#A900C0" : defaultMapColors.negative
			})
		)
	}
}
