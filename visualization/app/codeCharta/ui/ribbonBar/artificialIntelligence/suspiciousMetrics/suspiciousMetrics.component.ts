import { AfterViewInit, Component, Input, OnChanges, SimpleChanges, ViewChild } from "@angular/core"
import { dequal } from "dequal"
import { ArtificialIntelligenceData } from "../selectors/artificialIntelligence.selector"
import { MatMenu, MatMenuTrigger } from "@angular/material/menu"
import { SuspiciousMetricsMenuComponent } from "./suspiciousMetricsMenu/suspiciousMetricsMenu.component"

@Component({
    selector: "cc-suspicious-metrics",
    templateUrl: "./suspiciousMetrics.component.html",
    styleUrl: "./suspiciousMetrics.component.scss"
})
export class SuspiciousMetricsComponent implements OnChanges, AfterViewInit {
    @ViewChild(SuspiciousMetricsMenuComponent) menuComponent: SuspiciousMetricsMenuComponent
    @ViewChild("matMenuTrigger") matMenuTrigger: MatMenuTrigger
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
