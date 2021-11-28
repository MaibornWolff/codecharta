import { Component, Input } from "@angular/core"
import { Metric } from "../../util/metricHelper"

@Component({
	selector: "cc-attribute-side-bar-primary-metric",
	template: require("./attributeSideBarPrimaryMetric.component.html")
})
export class AttributeSideBarPrimaryMetricComponent {
	@Input() iconName: string
	@Input() metric: Metric
}
