import "./showScenariosButton.component.scss"
import { Component, Inject } from "@angular/core"
import { ScenarioService } from "./scenario.service"
import { ScenarioItem } from "./scenarioHelper"

@Component({
	selector: "cc-show-scenarios-button",
	template: require("./showScenariosButton.component.html")
})
export class ShowScenariosButtonComponent {
	scenarios: ScenarioItem[] = []

	constructor(@Inject(ScenarioService) public scenarioService: ScenarioService) {}

	loadScenarios() {
		this.scenarios = this.scenarioService.getScenarios()
	}
}
