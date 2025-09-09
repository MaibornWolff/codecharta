import { Component } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { AsyncPipe } from "@angular/common"
import { areaMetricSelector } from "../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { distributionMetric } from "../../../state/store/dynamicSettings/distributionMetric/distributionMetric.reducer"

@Component({
    selector: "cc-distribution-metric",
    templateUrl: "./distributionMetric.component.html",
    styleUrls: ["./distributionMetric.component.scss"],
    standalone: true,
    imports: [AsyncPipe]
})
export class DistributionMetricComponent {
    areaMetric$ = this.store.select(areaMetricSelector)
    readonly distributionMetric = distributionMetric

    constructor(private readonly store: Store<CcState>) {}
}
