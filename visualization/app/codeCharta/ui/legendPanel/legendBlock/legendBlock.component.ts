import { Component, Input } from "@angular/core"
import { MetricDescriptors } from "../../attributeSideBar/util/metricDescriptors"

@Component({
	selector: "cc-legend-block",
	template: require("./legendBlock.component.html")
})
export class LegendBlockComponent {
	@Input() metricFor: string
	@Input() metricDecorations: MetricDescriptors
}
