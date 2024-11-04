import { Component } from "@angular/core"
import { isDeltaStateSelector } from "../../state/selectors/isDeltaState.selector"
import { map } from "rxjs"
import { metricDataSelector } from "../../state/selectors/accumulatedData/metricData/metricData.selector"
import { Store } from "@ngrx/store"
import { CcState } from "../../codeCharta.model"

@Component({
    selector: "cc-ribbon-bar",
    templateUrl: "./ribbonBar.component.html",
    styleUrls: ["./ribbonBar.component.scss"]
})
export class RibbonBarComponent {
    isDeltaState$ = this.store.select(isDeltaStateSelector)
    hasEdgeMetric$ = this.store.select(metricDataSelector).pipe(map(metricData => metricData.edgeMetricData.length > 0))

    constructor(private readonly store: Store<CcState>) {}
}
