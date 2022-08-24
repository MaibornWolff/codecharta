import { Component, Input } from "@angular/core"
import { ArtificialIntelligenceData } from "../selectors/artificialIntelligence.selector"

@Component({
	selector: "cc-suspicious-metrics",
	template: require("./suspiciousMetrics.component.html")
})
export class SuspiciousMetricComponent {
	@Input() data: ArtificialIntelligenceData
}
