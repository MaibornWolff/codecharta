import { Component } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { setHeightMetric } from "../../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { heightMetricSelector } from "../../../state/store/dynamicSettings/heightMetric/heightMetric.selector"
import { MetricChooserComponent } from "../../metricChooser/metricChooser.component"
import { AsyncPipe } from "@angular/common"

@Component({
    selector: "cc-height-metric-chooser",
    templateUrl: "./heightMetricChooser.component.html",
    standalone: true,
    imports: [MetricChooserComponent, AsyncPipe]
})
export class HeightMetricChooserComponent {
    heightMetric$ = this.store.select(heightMetricSelector)

    constructor(private store: Store<CcState>) {}

    handleHeightMetricChanged(value: string) {
        this.store.dispatch(setHeightMetric({ value }))
    }
}
