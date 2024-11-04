import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../material/material.module"
import { ArtificialIntelligenceComponent } from "./artificialIntelligence.component"
import { HighRiskProfileComponent } from "./highRiskProfile/highRiskProfile.component"
import { RiskProfileBarDirective } from "./highRiskProfile/riskProfileBar.directive"
import { MatDialogModule } from "@angular/material/dialog"
import { SuspiciousMetricsModule } from "./suspiciousMetrics/suspiciousMetrics.module"
import { RibbonBarMenuButtonModule } from "../ribbonBarMenuButton/ribbonBarMenuButton.module"

@NgModule({
    imports: [CommonModule, MaterialModule, MatDialogModule, SuspiciousMetricsModule, RibbonBarMenuButtonModule],
    declarations: [ArtificialIntelligenceComponent, HighRiskProfileComponent, RiskProfileBarDirective],
    exports: [ArtificialIntelligenceComponent]
})
export class ArtificialIntelligenceModule {}
