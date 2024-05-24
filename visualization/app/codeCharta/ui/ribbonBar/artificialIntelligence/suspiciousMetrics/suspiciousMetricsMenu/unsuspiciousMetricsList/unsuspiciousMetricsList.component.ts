import { Component, Input } from "@angular/core"
import { ArtificialIntelligenceData } from "../../../selectors/artificialIntelligence.selector"
import { MatMenuTrigger } from "@angular/material/menu"

@Component({
	selector: "cc-unsuspicious-metrics-list",
	templateUrl: "./unsuspiciousMetricsList.component.html"
})
export class UnsuspiciousMetricsListComponent {
	@Input() matMenuTriggerReference: MatMenuTrigger
	@Input() data: Pick<
		ArtificialIntelligenceData,
		"analyzedProgrammingLanguage" | "unsuspiciousMetrics" | "suspiciousMetricSuggestionLinks" | "untrackedMetrics"
	>

	isUnsuspiciuosMetricsVisible = false

	toggleUnsuspiciousMetricsVisibility(): void {
		this.isUnsuspiciuosMetricsVisible = !this.isUnsuspiciuosMetricsVisible
	}
}
