import { Component, ElementRef, Inject, ViewChild } from "@angular/core"
import { MatSelectChange } from "@angular/material/select"
import { Store } from "../../../state/angular-redux/store"
import { nodeMetricDataSelector } from "../../../state/selectors/accumulatedData/metricData/nodeMetricData.selector"
import { setDistributionMetric } from "../../../state/store/dynamicSettings/distributionMetric/distributionMetric.actions"
import { distributionMetricSelector } from "../../../state/store/dynamicSettings/distributionMetric/distributionMetric.selector"

@Component({
	selector: "cc-distribution-metric-chooser",
	template: require("./distributionMetricChooser.component.html")
})
export class DistributionMetricChooserComponent {
	distributionMetric$ = this.store.select(distributionMetricSelector)
	nodeMetricData$ = this.store.select(nodeMetricDataSelector)
	searchTerm = ""

	@ViewChild("searchTermInput") searchTermInput: ElementRef<HTMLInputElement>

	constructor(@Inject(Store) private store: Store) {}

	handleDistributionMetricChanged(event: MatSelectChange) {
		this.store.dispatch(setDistributionMetric(event.value))
	}

	handleOpenedChanged(opened: boolean) {
		if (opened) {
			this.searchTermInput.nativeElement.focus()
		} else {
			this.searchTerm = ""
		}
	}
}
