import { Component, Input } from "@angular/core"
import { LegendMetric } from "../selectors/legendMetric"

@Component({
	selector: "cc-legend-block",
	template: require("./legendBlock.component.html")
})
export class LegendBlockComponent {
	@Input() metricFor: string
	@Input() legendMetric: LegendMetric
}
