import { Component } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { setDistributionMetric } from "../../../state/store/dynamicSettings/distributionMetric/distributionMetric.actions"
import { distributionMetricSelector } from "../../../state/store/dynamicSettings/distributionMetric/distributionMetric.selector"

@Component({
    selector: "cc-distribution-metric-chooser",
    templateUrl: "./distributionMetricChooser.component.html",
    styleUrls: ["./distributionMetricChooser.component.scss"]
})
export class DistributionMetricChooserComponent {
    distributionMetric$ = this.store.select(distributionMetricSelector)

    constructor(private store: Store<CcState>) {}

    handleDistributionMetricChanged(value: string) {
        this.store.dispatch(setDistributionMetric({ value }))
    }
}
