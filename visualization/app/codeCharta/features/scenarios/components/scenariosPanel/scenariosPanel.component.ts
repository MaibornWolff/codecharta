import { Component, signal, viewChild } from "@angular/core"
import { MetricData } from "../../../../codeCharta.model"
import { RibbonBarMenuButtonComponent } from "../../../../ui/ribbonBar/ribbonBarMenuButton/ribbonBarMenuButton.component"
import { ScenarioListDialogComponent } from "../scenarioListDialog/scenarioListDialog.component"
import { SaveScenarioDialogComponent } from "../saveScenarioDialog/saveScenarioDialog.component"
import { ApplyScenarioDialogComponent } from "../applyScenarioDialog/applyScenarioDialog.component"
import { Scenario } from "../../model/scenario.model"

@Component({
    selector: "cc-scenarios-panel",
    templateUrl: "./scenariosPanel.component.html",
    imports: [RibbonBarMenuButtonComponent, ScenarioListDialogComponent, SaveScenarioDialogComponent, ApplyScenarioDialogComponent]
})
export class ScenariosPanelComponent {
    readonly listDialog = viewChild.required<ScenarioListDialogComponent>("listDialog")
    readonly saveDialog = viewChild.required<SaveScenarioDialogComponent>("saveDialog")

    readonly applyTarget = signal<{ scenario: Scenario; metricData: MetricData } | null>(null)

    openScenarioList() {
        this.listDialog().open()
    }

    openSaveDialog() {
        this.saveDialog().open()
    }

    handleApplyRequested(event: { scenario: Scenario; metricData: MetricData }) {
        this.applyTarget.set(event)
    }

    handleApplyClosed() {
        this.applyTarget.set(null)
    }
}
