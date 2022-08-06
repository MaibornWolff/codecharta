import "./scenarios.component.scss"
import { Component, Inject, ViewChild } from "@angular/core"
import { MatMenuTrigger } from "@angular/material/menu"
import { ScenarioItem } from "../../scenarioDropDown/scenarioDropDown.component"
import { AddCustomScenarioComponent } from "../../scenarioDropDown/addCustomScenario/addCustomScenario.component"
import { MatDialog } from "@angular/material/dialog"
import { ScenarioService } from "./scenario.service"

@Component({
	selector: "cc-scenarios",
	template: require("./scenarios.component.html")
})
export class ScenariosComponent {
	scenarios: ScenarioItem[] = []
	@ViewChild("scenariosMenuTrigger") private scenariosMenuTrigger: MatMenuTrigger

	constructor(@Inject(ScenarioService) public scenarioService: ScenarioService, @Inject(MatDialog) private dialog: MatDialog) {}

	openScenarios = () => {
		this.scenarios = this.scenarioService.getScenarios()
		this.scenariosMenuTrigger.openMenu()
	}

	addScenario() {
		this.dialog.open(AddCustomScenarioComponent, { panelClass: "cc-add-custom-scenario" })
	}
}
