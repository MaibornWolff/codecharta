import { Component, Inject, ViewEncapsulation } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"
import { setDistributionMetric } from "../../../state/store/dynamicSettings/distributionMetric/distributionMetric.actions"
import { distributionMetricSelector } from "../../../state/store/dynamicSettings/distributionMetric/distributionMetric.selector"

@Component({
	selector: "cc-distribution-metric-chooser",
	templateUrl: "./distributionMetricChooser.component.html",
	encapsulation: ViewEncapsulation.None
})
export class DistributionMetricChooserComponent {
	distributionMetric$ = this.store.select(distributionMetricSelector)

	constructor(@Inject(Store) private store: Store) {}

	handleDistributionMetricChanged(value: string) {
		this.store.dispatch(setDistributionMetric(value))
	}
}
