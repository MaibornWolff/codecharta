import { Component } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { setDistributionMetric } from "../../../state/store/dynamicSettings/distributionMetric/distributionMetric.actions"
import { distributionMetricSelector } from "../../../state/store/dynamicSettings/distributionMetric/distributionMetric.selector"
import { MetricChooserComponent } from "../../metricChooser/metricChooser.component"
import { AsyncPipe } from "@angular/common"

@Component({
    selector: "cc-distribution-metric-chooser",
    templateUrl: "./distributionMetricChooser.component.html",
    styleUrls: ["./distributionMetricChooser.component.scss"],
    standalone: true,
    imports: [MetricChooserComponent, AsyncPipe]
})
export class DistributionMetricChooserComponent {
    distributionMetric$ = this.store.select(distributionMetricSelector)

    constructor(private store: Store<CcState>) {}

    handleDistributionMetricChanged(value: string) {
        this.store.dispatch(setDistributionMetric({ value }))
    }
}
