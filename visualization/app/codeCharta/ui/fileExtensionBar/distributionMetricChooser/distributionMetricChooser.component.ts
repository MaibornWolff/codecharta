import { Component, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"
import { State } from "../../../codeCharta.model"
import { setDistributionMetric } from "../../../state/store/dynamicSettings/distributionMetric/distributionMetric.actions"
import { distributionMetricSelector } from "../../../state/store/dynamicSettings/distributionMetric/distributionMetric.selector"

@Component({
	selector: "cc-distribution-metric-chooser",
	templateUrl: "./distributionMetricChooser.component.html",
	encapsulation: ViewEncapsulation.None
})
export class DistributionMetricChooserComponent {
	distributionMetric$ = this.store.select(distributionMetricSelector)

	constructor(private store: Store<State>) {}

	handleDistributionMetricChanged(value: string) {
		this.store.dispatch(setDistributionMetric({ value }))
	}
}
