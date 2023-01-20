import { Component, Input } from "@angular/core"
import { MetricDecorations } from "../../attributeSideBar/util/metricDecorations"

@Component({
	selector: "cc-legend-block",
	template: require("./legendBlock.component.html")
})
export class LegendBlockComponent {
	@Input() metricFor: string
	@Input() metricDecorations: MetricDecorations
}
