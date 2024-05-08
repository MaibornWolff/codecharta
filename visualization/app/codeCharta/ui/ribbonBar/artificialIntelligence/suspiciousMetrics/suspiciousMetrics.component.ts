import { Component, Input, OnChanges, SimpleChanges, ViewChild, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"
import { dequal } from "dequal"
import { setMapColors } from "../../../../state/store/appSettings/mapColors/mapColors.actions"
import { defaultMapColors } from "../../../../state/store/appSettings/mapColors/mapColors.reducer"
import { setAreaMetric } from "../../../../state/store/dynamicSettings/areaMetric/areaMetric.actions"
import { setColorMetric } from "../../../../state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { setColorRange } from "../../../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { setHeightMetric } from "../../../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { ArtificialIntelligenceData } from "../selectors/artificialIntelligence.selector"
import { AREA_METRIC } from "../selectors/util/riskProfileHelper"
import { MetricSuggestionParameters } from "../selectors/util/suspiciousMetricsHelper"
import { metricTitles } from "../../../../util/metric/metricTitles"
import { MatDialog } from "@angular/material/dialog"
import { MatMenuTrigger } from "@angular/material/menu"

@Component({
	selector: "cc-suspicious-metrics",
	templateUrl: "./suspiciousMetrics.component.html",
	encapsulation: ViewEncapsulation.None
})
export class SuspiciousMetricComponent implements OnChanges {
	@ViewChild(MatMenuTrigger) trigger: MatMenuTrigger
	@Input() data: Pick<
		ArtificialIntelligenceData,
		"analyzedProgrammingLanguage" | "unsuspiciousMetrics" | "suspiciousMetricSuggestionLinks" | "untrackedMetrics"
	>
	hideBadge = false
	isUntrackedMetricsVisible = false
	isUnsuspiciuosMetricsVisible = false

	constructor(private store: Store, public dialog: MatDialog) {}

	getNameAndDescriptionOfMetric(metricName: string): string {
		const metricDescription = metricTitles.get(metricName)
		if (metricDescription) {
			return `${metricName.toUpperCase()} (${metricDescription.toLowerCase()})`
		}
		return metricName.toUpperCase()
	}

	toggleUntrackedMetricsVisibility(): void {
		this.isUntrackedMetricsVisible = !this.isUntrackedMetricsVisible
	}

	toggleUnsuspiciousMetricsVisibility(): void {
		this.isUnsuspiciuosMetricsVisible = !this.isUnsuspiciuosMetricsVisible
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.data && !dequal(changes.data.previousValue, changes.data.currentValue)) {
			this.hideBadge = false
		}
	}

	openDialog(): void {
		this.dialog.open(SuspiciousMetricDialogComponent, {
			width: "500px"
		})
	}

	applySuspiciousMetric(metric: MetricSuggestionParameters, markOutlier: boolean) {
		this.trigger.closeMenu()
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
}

@Component({
	selector: "cc-suspicious-metric-dialog",
	templateUrl: "./suspiciousMetricDialog.component.html",
	encapsulation: ViewEncapsulation.None
})
export class SuspiciousMetricDialogComponent {}
