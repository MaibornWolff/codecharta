import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../material/material.module"
import { ArtificialIntelligenceComponent } from "./artificialIntelligence.component"
import { HighRiskProfileComponent } from "./highRiskProfile/highRiskProfile.component"
import { RiskProfileBarDirective } from "./highRiskProfile/riskProfileBar.directive"
import { SuspiciousMetricComponent, SuspiciousMetricDialogComponent } from "./suspiciousMetrics/suspiciousMetrics.component"
import { MatDialogModule } from "@angular/material/dialog"

@NgModule({
	imports: [CommonModule, MaterialModule, MatDialogModule],
	declarations: [
		ArtificialIntelligenceComponent,
		HighRiskProfileComponent,
		SuspiciousMetricComponent,
		RiskProfileBarDirective,
		SuspiciousMetricDialogComponent
	],
	exports: [ArtificialIntelligenceComponent]
})
export class ArtificialIntelligenceModule {}
