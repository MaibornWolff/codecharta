import { Component, Input } from "@angular/core"
import { ArtificialIntelligenceData } from "../../../selectors/artificialIntelligence.selector"
import { MatMenuTrigger } from "@angular/material/menu"
import { NgClass } from "@angular/common"

@Component({
    selector: "cc-untracked-metrics-list",
    templateUrl: "./untrackedMetricsList.component.html",
    standalone: true,
    imports: [NgClass]
})
export class UntrackedMetricsListComponent {
    @Input() matMenuTriggerReference: MatMenuTrigger
    @Input() data: Pick<
        ArtificialIntelligenceData,
        "analyzedProgrammingLanguage" | "unsuspiciousMetrics" | "suspiciousMetricSuggestionLinks" | "untrackedMetrics"
    >

    isUntrackedMetricsVisible = false

    toggleUntrackedMetricsVisibility(): void {
        this.isUntrackedMetricsVisible = !this.isUntrackedMetricsVisible
    }
}
