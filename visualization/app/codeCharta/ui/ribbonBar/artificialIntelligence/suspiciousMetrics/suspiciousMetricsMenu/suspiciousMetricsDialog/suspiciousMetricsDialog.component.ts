import { Component, Input } from "@angular/core"
import { ArtificialIntelligenceData } from "../../../selectors/artificialIntelligence.selector"
import { MatMenuTrigger } from "@angular/material/menu"

@Component({
    selector: "cc-suspicious-metric-dialog",
    templateUrl: "./suspiciousMetricDialog.component.html"
})
export class SuspiciousMetricsDialogComponent {
    @Input() matMenuTriggerReference: MatMenuTrigger
    @Input() data: Pick<
        ArtificialIntelligenceData,
        "analyzedProgrammingLanguage" | "unsuspiciousMetrics" | "suspiciousMetricSuggestionLinks" | "untrackedMetrics"
    >
}
