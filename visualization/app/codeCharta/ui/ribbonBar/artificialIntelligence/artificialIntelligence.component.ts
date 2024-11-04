import { Component } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { artificialIntelligenceSelector } from "./selectors/artificialIntelligence.selector"
import { SuspiciousMetricsComponent } from "./suspiciousMetrics/suspiciousMetrics.component"
import { HighRiskProfileComponent } from "./highRiskProfile/highRiskProfile.component"
import { AsyncPipe } from "@angular/common"

@Component({
    selector: "cc-artificial-intelligence",
    templateUrl: "./artificialIntelligence.component.html",
    styleUrls: ["./artificialIntelligence.component.scss"],
    standalone: true,
    imports: [SuspiciousMetricsComponent, HighRiskProfileComponent, AsyncPipe]
})
export class ArtificialIntelligenceComponent {
    data$ = this.store.select(artificialIntelligenceSelector)

    constructor(private store: Store<CcState>) {}
}
