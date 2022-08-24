import { Component, Input } from "@angular/core"
import { ArtificialIntelligenceData } from "../selectors/artificialIntelligence.selector"

@Component({
	selector: "cc-high-risk-profile",
	template: require("./highRiskProfile.component.html")
})
export class HighRiskProfileComponent {
	@Input() data: ArtificialIntelligenceData
}
