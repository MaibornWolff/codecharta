import { Component } from "@angular/core"
import { ScenarioService } from "./scenario.service"
import { ScenarioItem } from "./scenarioHelper"

@Component({
    selector: "cc-show-scenarios-button",
    templateUrl: "./showScenariosButton.component.html",
    styleUrls: ["./showScenariosButton.component.scss"]
})
export class ShowScenariosButtonComponent {
    scenarios: ScenarioItem[] = []

    constructor(public scenarioService: ScenarioService) {}

    loadScenarios() {
        this.scenarios = this.scenarioService.getScenarios()
    }
}
