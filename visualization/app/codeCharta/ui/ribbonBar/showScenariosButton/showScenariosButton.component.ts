import { Component } from "@angular/core"
import { ScenarioService } from "./scenario.service"
import { ScenarioItem } from "./scenarioHelper"
import { RibbonBarMenuButtonComponent } from "../ribbonBarMenuButton/ribbonBarMenuButton.component"
import { MatMenuTrigger, MatMenu } from "@angular/material/menu"
import { ScenariosComponent } from "./scenarios/scenarios.component"

@Component({
    selector: "cc-show-scenarios-button",
    templateUrl: "./showScenariosButton.component.html",
    styleUrls: ["./showScenariosButton.component.scss"],
    standalone: true,
    imports: [RibbonBarMenuButtonComponent, MatMenuTrigger, MatMenu, ScenariosComponent]
})
export class ShowScenariosButtonComponent {
    scenarios: ScenarioItem[] = []

    constructor(public scenarioService: ScenarioService) {}

    loadScenarios() {
        this.scenarios = this.scenarioService.getScenarios()
    }
}
