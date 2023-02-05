import { Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from "@angular/core"
import isEqual from "fast-deep-equal"
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
	templateUrl: "./suspiciousMetrics.component.html",
	encapsulation: ViewEncapsulation.None
})
export class SuspiciousMetricComponent implements OnChanges {
	@Input() data: Pick<
		ArtificialIntelligenceData,
		"analyzedProgrammingLanguage" | "unsuspiciousMetrics" | "suspiciousMetricSuggestionLinks" | "untrackedMetrics"
	>
	hideBadge = false

	constructor(private store: Store) {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.data && !isEqual(changes.data.previousValue, changes.data.currentValue)) {
			this.hideBadge = false
		}
	}

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
