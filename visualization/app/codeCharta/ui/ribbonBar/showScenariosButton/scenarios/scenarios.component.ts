import { Component, Input } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { ScenarioService } from "../scenario.service"
import { ScenarioItem } from "../scenarioHelper"
import { AddCustomScenarioDialogComponent } from "../addCustomScenarioDialog/addCustomScenarioDialog.component"

@Component({
    selector: "cc-scenarios",
    templateUrl: "./scenarios.component.html",
    styleUrls: ["./scenarios.component.scss"]
})
export class ScenariosComponent {
    @Input() scenarios: ScenarioItem[] = []

    constructor(
        public scenarioService: ScenarioService,
        private dialog: MatDialog
    ) {}

    addScenario() {
        this.dialog.open(AddCustomScenarioDialogComponent, { panelClass: "cc-add-custom-scenario" })
    }
}
