import "./scenarios.component.scss"
import { Component, Inject, Input } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { ScenarioService } from "../scenario.service"
import { ScenarioItem } from "../scenarioHelper"
import { AddCustomScenarioComponent } from "../addCustomScenario/addCustomScenario.component"

@Component({
	selector: "cc-scenarios",
	template: require("./scenarios.component.html")
})
export class ScenariosComponent {
	@Input() scenarios: ScenarioItem[] = []

	constructor(@Inject(ScenarioService) public scenarioService: ScenarioService, @Inject(MatDialog) private dialog: MatDialog) {}

	addScenario() {
		this.dialog.open(AddCustomScenarioComponent, { panelClass: "cc-add-custom-scenario" })
	}
}
