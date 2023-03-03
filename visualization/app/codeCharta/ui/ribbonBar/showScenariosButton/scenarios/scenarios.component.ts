import { Component, Input, ViewEncapsulation } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { ScenarioService } from "../scenario.service"
import { ScenarioItem } from "../scenarioHelper"
import { AddCustomScenarioComponent } from "../addCustomScenario/addCustomScenario.component"

@Component({
	selector: "cc-scenarios",
	templateUrl: "./scenarios.component.html",
	styleUrls: ["./scenarios.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class ScenariosComponent {
	@Input() scenarios: ScenarioItem[] = []

	constructor(public scenarioService: ScenarioService, private dialog: MatDialog) {}

	addScenario() {
		this.dialog.open(AddCustomScenarioComponent, { panelClass: "cc-add-custom-scenario" })
	}
}
