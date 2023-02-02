import { Component, Input, ViewEncapsulation } from "@angular/core"
import { LegendMetric } from "../selectors/legendMetric"

@Component({
	selector: "cc-legend-block",
	templateUrl: "./legendBlock.component.html",
	encapsulation: ViewEncapsulation.None
})
export class LegendBlockComponent {
	@Input() metricFor: string
	@Input() legendMetric: LegendMetric
}
