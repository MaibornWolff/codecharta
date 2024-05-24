import { Component, EventEmitter, Input, Output } from "@angular/core"
import { metricTitles } from "../../../../../../util/metric/metricTitles"
import { MetricSuggestionParameters } from "../../../selectors/util/suspiciousMetricsHelper"
import { setAreaMetric } from "../../../../../../state/store/dynamicSettings/areaMetric/areaMetric.actions"
import { AREA_METRIC } from "../../../selectors/util/riskProfileHelper"
import { setHeightMetric } from "../../../../../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { setColorMetric } from "../../../../../../state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { setColorRange } from "../../../../../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { setMapColors } from "../../../../../../state/store/appSettings/mapColors/mapColors.actions"
import { defaultMapColors } from "../../../../../../state/store/appSettings/mapColors/mapColors.reducer"
import { ArtificialIntelligenceData } from "../../../selectors/artificialIntelligence.selector"
import { Store } from "@ngrx/store"
import { MatDialog } from "@angular/material/dialog"

@Component({
	selector: "cc-suspicious-metrics-list",
	templateUrl: "./suspiciousMetricsList.component.html"
})
export class SuspiciousMetricsListComponent {
	@Output() menuClosed = new EventEmitter<void>()
	@Input() data: Pick<
		ArtificialIntelligenceData,
		"analyzedProgrammingLanguage" | "unsuspiciousMetrics" | "suspiciousMetricSuggestionLinks" | "untrackedMetrics"
	>
	constructor(private store: Store, public dialog: MatDialog) {}

	applySuspiciousMetric(metric: MetricSuggestionParameters, markOutlier: boolean) {
		this.menuClosed.emit()
		this.store.dispatch(setAreaMetric({ value: AREA_METRIC }))
		this.store.dispatch(setHeightMetric({ value: metric.metric }))
		this.store.dispatch(setColorMetric({ value: metric.metric }))
		this.store.dispatch(
			setColorRange({
				value: {
					from: metric.from,
					to: markOutlier ? metric.outlierThreshold : metric.to
				}
			})
		)
		this.store.dispatch(
			setMapColors({
				value: {
					positive: markOutlier ? "#ffffff" : defaultMapColors.positive,
					neutral: markOutlier ? "#ffffff" : defaultMapColors.neutral,
					negative: markOutlier ? "#A900C0" : defaultMapColors.negative
				}
			})
		)
	}

	getNameAndDescriptionOfMetric(metricName: string): string {
		const metricDescription = metricTitles.get(metricName)
		if (metricDescription) {
			return `${metricName.toUpperCase()} (${metricDescription.toLowerCase()})`
		}
		return metricName.toUpperCase()
	}
}
