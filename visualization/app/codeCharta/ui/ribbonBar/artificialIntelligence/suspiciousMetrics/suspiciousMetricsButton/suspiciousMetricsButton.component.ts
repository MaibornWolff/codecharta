import { Component, Input, OnChanges, SimpleChanges, ViewChild, AfterViewInit } from "@angular/core"
import { dequal } from "dequal"
import { ArtificialIntelligenceData } from "../../selectors/artificialIntelligence.selector"
import { MatMenu } from "@angular/material/menu"
import { SuspiciousMetricsMenuComponent } from "../suspiciousMetricsMenu/suspiciousMetricsMenu.component"

@Component({
	selector: "cc-suspicious-metrics-button",
	templateUrl: "./suspiciousMetricsButton.component.html"
})
export class SuspiciousMetricsButtonComponent implements OnChanges, AfterViewInit {
	@ViewChild(SuspiciousMetricsMenuComponent) menuComponent: SuspiciousMetricsMenuComponent
	@Input() data: Pick<
		ArtificialIntelligenceData,
		"analyzedProgrammingLanguage" | "unsuspiciousMetrics" | "suspiciousMetricSuggestionLinks" | "untrackedMetrics"
	>

	@Input() menu: MatMenu

	hideBadge = false

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.data && !dequal(changes.data.previousValue, changes.data.currentValue)) {
			this.hideBadge = false
		}
	}

	ngAfterViewInit(): void {
		if (this.menuComponent) {
			this.menu = this.menuComponent.menu
		}
	}
}
