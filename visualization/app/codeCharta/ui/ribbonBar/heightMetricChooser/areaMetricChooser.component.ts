import { Component, Inject } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"
import { setHeightMetric } from "../../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { heightMetricSelector } from "../../../state/store/dynamicSettings/heightMetric/heightMetric.selector"

@Component({
	selector: "cc-height-metric-chooser",
	template: require("./heightMetricChooser.component.html")
})
export class HeightMetricChooserComponent {
	heightMetric$ = this.store.select(heightMetricSelector)

	constructor(@Inject(Store) private store: Store) {}

	handleHeightMetricChanged(value: string) {
		this.store.dispatch(setHeightMetric(value))
	}
}
