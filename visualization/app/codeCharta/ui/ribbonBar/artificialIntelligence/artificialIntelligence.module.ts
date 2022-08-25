import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../material/material.module"
import { ArtificialIntelligenceComponent } from "./artificialIntelligence.component"
import { HighRiskProfileComponent } from "./highRiskProfile/highRiskProfile.component"
import { RiskProfileBarDirective } from "./highRiskProfile/riskProfileBar.directive"
import { SuspiciousMetricComponent } from "./suspiciousMetrics/suspiciousMetrics.component"

@NgModule({
	imports: [MaterialModule],
	declarations: [ArtificialIntelligenceComponent, HighRiskProfileComponent, SuspiciousMetricComponent, RiskProfileBarDirective],
	exports: [ArtificialIntelligenceComponent],
	entryComponents: [ArtificialIntelligenceComponent]
})
export class ArtificialIntelligenceModule {}
