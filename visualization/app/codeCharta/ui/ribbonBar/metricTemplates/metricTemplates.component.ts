import "./metricTemplates.component.scss"
import { Component } from "@angular/core"

@Component({
	selector: "cc-metric-templates",
	template: require("./metricTemplates.component.html")
})
export class MetricTemplatesComponent {
	openMetricTemplates() {
		// console.log("open")
	}
}
