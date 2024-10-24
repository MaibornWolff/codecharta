import { Component, Input, ViewChild } from "@angular/core"
import { MatMenu, MatMenuTrigger } from "@angular/material/menu"
import { ArtificialIntelligenceData } from "../../selectors/artificialIntelligence.selector"
import { MatDialog } from "@angular/material/dialog"
import { SuspiciousMetricsDialogComponent } from "./suspiciousMetricsDialog/suspiciousMetricsDialog.component"

@Component({
    selector: "cc-suspicious-metrics-menu",
    templateUrl: "./suspiciousMetricsMenu.component.html",
    styleUrls: ["./suspiciousMetricsMenu.component.scss"]
})
export class SuspiciousMetricsMenuComponent {
    @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger
    @ViewChild(MatMenu) menu: MatMenu
    @Input() matMenuTriggerReference: MatMenuTrigger
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
