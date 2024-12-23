import { Component, Input } from "@angular/core"
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
import { MatMenuTrigger } from "@angular/material/menu"
import { NgClass } from "@angular/common"
import { MatButtonToggleGroup, MatButtonToggle } from "@angular/material/button-toggle"
import { TruncateTextPipe } from "../../../../../../util/pipes/truncateText.pipe"

@Component({
    selector: "cc-suspicious-metrics-list",
    templateUrl: "./suspiciousMetricsList.component.html",
    styleUrls: ["./suspiciousMetricsList.component.scss"],
    standalone: true,
    imports: [NgClass, MatButtonToggleGroup, MatButtonToggle, TruncateTextPipe]
})
export class SuspiciousMetricsListComponent {
    @Input() matMenuTriggerReference: MatMenuTrigger
    @Input() data: Pick<
        ArtificialIntelligenceData,
        "analyzedProgrammingLanguage" | "unsuspiciousMetrics" | "suspiciousMetricSuggestionLinks" | "untrackedMetrics"
    >
    isSuspiciuosMetricsVisible = true

    constructor(
        private store: Store,
        public dialog: MatDialog
    ) {}

    toggleSuspiciousMetricsVisibility(): void {
        this.isSuspiciuosMetricsVisible = !this.isSuspiciuosMetricsVisible
    }

    applySuspiciousMetric(metric: MetricSuggestionParameters, markOutlier: boolean) {
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
        this.matMenuTriggerReference.closeMenu()
    }

    getNameAndDescriptionOfMetric(metricName: string): string {
        const metricDescription = metricTitles.get(metricName)
        if (metricDescription) {
            return `${metricName.toUpperCase()} (${metricDescription.toLowerCase()})`
        }
        return metricName.toUpperCase()
    }

    getDescriptionOfMetric(metricName: string): string {
        const metricDescription = metricTitles.get(metricName)
        if (metricDescription) {
            return `${metricDescription.toLowerCase()}`
        }
        return ""
    }
}
