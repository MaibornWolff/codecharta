import { Component, Input, ViewChild } from "@angular/core"
import { MatMenu } from "@angular/material/menu"
import { ArtificialIntelligenceData } from "../selectors/artificialIntelligence.selector"
import { MatDialog } from "@angular/material/dialog"
import { SuspiciousMetricsDialogComponent } from "./suspiciousMetricsDialog.component"

@Component({
	selector: "cc-suspicious-metrics-menu",
	templateUrl: "./suspiciousMetricsMenu.component.html"
})
export class SuspiciousMetricsMenuComponent {
	@ViewChild("menu", { static: true }) menu: MatMenu // ViewChild für das matMenu
	@Input() data: Pick<
		ArtificialIntelligenceData,
		"analyzedProgrammingLanguage" | "unsuspiciousMetrics" | "suspiciousMetricSuggestionLinks" | "untrackedMetrics"
	>

	constructor(public dialog: MatDialog) {}

	openDialog(): void {
		this.dialog.open(SuspiciousMetricsDialogComponent, {
			width: "500px"
		})
	}
}
