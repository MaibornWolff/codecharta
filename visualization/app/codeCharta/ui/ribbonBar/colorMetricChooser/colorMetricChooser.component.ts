import { Component, ViewEncapsulation } from "@angular/core"
import { setColorMetric } from "../../../state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { colorMetricSelector } from "../../../state/store/dynamicSettings/colorMetric/colorMetric.selector"
import { isColorMetricLinkedToHeightMetricSelector } from "../../../state/store/appSettings/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.selector"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"

@Component({
    selector: "cc-color-metric-chooser",
    templateUrl: "./colorMetricChooser.component.html",
    encapsulation: ViewEncapsulation.None
})
export class ColorMetricChooserComponent {
    colorMetric$ = this.store.select(colorMetricSelector)
    isColorMetricLinkedToHeightMetric$ = this.store.select(isColorMetricLinkedToHeightMetricSelector)
    nonDisabledColor = "rgba(0, 0, 0, 0.38)"
    disabledColor = "rgba(68,68,68, 1)"

    constructor(private store: Store<CcState>) {}

    handleColorMetricChanged(value: string) {
        this.store.dispatch(setColorMetric({ value }))
    }
}
