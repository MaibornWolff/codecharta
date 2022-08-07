import "./showScenariosButton.component.scss"
import { Component, Inject, ViewChild } from "@angular/core"
import { MatMenuTrigger } from "@angular/material/menu"
import { ScenarioService } from "./scenario.service"
import { ScenarioItem } from "./scenarioHelper"

@Component({
	selector: "cc-show-scenarios-button",
	template: require("./showScenariosButton.component.html")
})
export class ShowScenariosButtonComponent {
	scenarios: ScenarioItem[] = []
	@ViewChild("scenariosMenuTrigger") private scenariosMenuTrigger: MatMenuTrigger

	constructor(@Inject(ScenarioService) public scenarioService: ScenarioService) {}

	openScenarios = () => {
		this.scenarios = this.scenarioService.getScenarios()
		this.scenariosMenuTrigger.openMenu()
	}
}
