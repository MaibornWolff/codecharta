import { Component, ViewEncapsulation } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"
import { setHeightMetric } from "../../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { heightMetricSelector } from "../../../state/store/dynamicSettings/heightMetric/heightMetric.selector"

@Component({
	selector: "cc-height-metric-chooser",
	templateUrl: "./heightMetricChooser.component.html",
	encapsulation: ViewEncapsulation.None
})
export class HeightMetricChooserComponent {
	heightMetric$ = this.store.select(heightMetricSelector)

	constructor(private store: Store) {}

	handleHeightMetricChanged(value: string) {
		this.store.dispatch(setHeightMetric(value))
	}
}
