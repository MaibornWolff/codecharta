import { Component, Input } from "@angular/core"
import { ArtificialIntelligenceData } from "../selectors/artificialIntelligence.selector"
import { RibbonBarMenuButtonComponent } from "../../ribbonBarMenuButton/ribbonBarMenuButton.component"
import { MatMenuTrigger, MatMenu } from "@angular/material/menu"
import { RiskProfileBarDirective } from "./riskProfileBar.directive"

@Component({
    selector: "cc-high-risk-profile",
    templateUrl: "./highRiskProfile.component.html",
    styleUrl: "./highRiskProfile.component.scss",
    standalone: true,
    imports: [RibbonBarMenuButtonComponent, MatMenuTrigger, MatMenu, RiskProfileBarDirective]
})
export class HighRiskProfileComponent {
    @Input() data: Pick<ArtificialIntelligenceData, "analyzedProgrammingLanguage" | "riskProfile">
}
