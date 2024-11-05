import { Component } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { setAreaMetric } from "../../../state/store/dynamicSettings/areaMetric/areaMetric.actions"
import { areaMetricSelector } from "../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { MetricChooserComponent } from "../../metricChooser/metricChooser.component"
import { AsyncPipe } from "@angular/common"

@Component({
    selector: "cc-area-metric-chooser",
    templateUrl: "./areaMetricChooser.component.html",
    standalone: true,
    imports: [MetricChooserComponent, AsyncPipe]
})
export class AreaMetricChooserComponent {
    areaMetric$ = this.store.select(areaMetricSelector)

    constructor(private store: Store<CcState>) {}

    handleAreaMetricChanged(value: string) {
        this.store.dispatch(setAreaMetric({ value }))
    }
}
