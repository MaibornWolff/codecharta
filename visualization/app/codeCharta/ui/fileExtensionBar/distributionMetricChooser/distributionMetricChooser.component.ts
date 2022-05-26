import { Component, Inject } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"
import { setDistributionMetric } from "../../../state/store/dynamicSettings/distributionMetric/distributionMetric.actions"
import { distributionMetricSelector } from "../../../state/store/dynamicSettings/distributionMetric/distributionMetric.selector"

@Component({
	selector: "cc-distribution-metric-chooser",
	template: require("./distributionMetricChooser.component.html")
})
export class DistributionMetricChooserComponent {
	distributionMetric$ = this.store.select(distributionMetricSelector)

	constructor(@Inject(Store) private store: Store) {}

	handleDistributionMetricChanged(value: string) {
		this.store.dispatch(setDistributionMetric(value))
	}
}
