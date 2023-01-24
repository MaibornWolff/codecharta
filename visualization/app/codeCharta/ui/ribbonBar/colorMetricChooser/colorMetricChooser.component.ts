import { Component, ViewEncapsulation } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"
import { setColorMetric } from "../../../state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { colorMetricSelector } from "../../../state/store/dynamicSettings/colorMetric/colorMetric.selector"
import { isColorMetricLinkedToHeightMetricSelector } from "../../../state/store/appSettings/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.selector"

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

	constructor(private store: Store) {}

	handleColorMetricChanged(value: string) {
		this.store.dispatch(setColorMetric(value))
	}
}
