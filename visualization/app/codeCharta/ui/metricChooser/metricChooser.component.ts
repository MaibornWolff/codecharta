import "./metricChooser.component.scss"
import { Component, ElementRef, Inject, Input, ViewChild } from "@angular/core"
import { Store } from "../../state/angular-redux/store"
import { nodeMetricDataSelector } from "../../state/selectors/accumulatedData/metricData/nodeMetricData.selector"

@Component({
	selector: "cc-metric-chooser",
	template: require("./metricChooser.component.html")
})
export class MetricChooserComponent {
	@Input() selectedMetricName: string
	@Input() searchPlaceholder: string
	@Input() handleMetricChanged: (newSelectedMetricName: string) => void
	@ViewChild("searchTermInput") searchTermInput: ElementRef<HTMLInputElement>
	nodeMetricData$ = this.store.select(nodeMetricDataSelector)
	searchTerm = ""

	constructor(@Inject(Store) private store: Store) {}

	handleOpenedChanged(opened: boolean) {
		if (opened) {
			this.searchTermInput.nativeElement.focus()
		} else {
			this.searchTerm = ""
		}
	}
}
