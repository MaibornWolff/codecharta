import { Component, Input, ViewEncapsulation } from "@angular/core"
import { MetricDescriptors } from "../../attributeSideBar/util/metricDescriptors"

@Component({
	selector: "cc-legend-block",
	templateUrl: "./legendBlock.component.html",
	encapsulation: ViewEncapsulation.None
})
export class LegendBlockComponent {
	@Input() metricFor: string
	@Input() metricDecorations: MetricDescriptors
}
