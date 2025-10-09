import { Component } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { artificialIntelligenceSelector } from "./selectors/artificialIntelligence.selector"
import { SuspiciousMetricsComponent } from "./suspiciousMetrics/suspiciousMetrics.component"
import { AsyncPipe } from "@angular/common"

@Component({
    selector: "cc-artificial-intelligence",
    templateUrl: "./artificialIntelligence.component.html",
    styleUrls: ["./artificialIntelligence.component.scss"],
    imports: [SuspiciousMetricsComponent, AsyncPipe]
})
export class ArtificialIntelligenceComponent {
    data$ = this.store.select(artificialIntelligenceSelector)

    constructor(private readonly store: Store<CcState>) {}
}
