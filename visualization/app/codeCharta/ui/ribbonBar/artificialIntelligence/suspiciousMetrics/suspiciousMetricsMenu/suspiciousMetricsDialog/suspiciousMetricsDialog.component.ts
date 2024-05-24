import { Component, Input, ViewEncapsulation } from "@angular/core"
import { ArtificialIntelligenceData } from "../../../selectors/artificialIntelligence.selector"
import { MatMenuTrigger } from "@angular/material/menu"

@Component({
	selector: "cc-suspicious-metric-dialog",
	templateUrl: "./suspiciousMetricDialog.component.html",
	encapsulation: ViewEncapsulation.None
})
export class SuspiciousMetricsDialogComponent {
	@Input() matMenuTriggerReference: MatMenuTrigger
	@Input() data: Pick<
		ArtificialIntelligenceData,
		"analyzedProgrammingLanguage" | "unsuspiciousMetrics" | "suspiciousMetricSuggestionLinks" | "untrackedMetrics"
	>
}
