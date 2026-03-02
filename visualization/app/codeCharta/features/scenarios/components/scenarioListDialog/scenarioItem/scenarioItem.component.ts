import { Component, input, output } from "@angular/core"
import { SCENARIO_SECTION_ICONS, SCENARIO_SECTION_LABELS } from "../../../model/scenario.model"
import { ScenarioView } from "../scenarioListDialog.component"

@Component({
    selector: "cc-scenario-item",
    templateUrl: "./scenarioItem.component.html"
})
export class ScenarioItemComponent {
    readonly view = input.required<ScenarioView>()
    readonly applyRequested = output<void>()
    readonly exportRequested = output<void>()
    readonly deleteRequested = output<void>()

    readonly sectionLabels = SCENARIO_SECTION_LABELS
    readonly sectionIcons = SCENARIO_SECTION_ICONS
}
