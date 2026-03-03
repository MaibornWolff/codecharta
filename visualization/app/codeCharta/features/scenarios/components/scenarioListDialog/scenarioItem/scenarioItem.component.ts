import { Component, input, output } from "@angular/core"
import { ScenarioView } from "../scenarioListDialog.component"
import { ScenarioItemBadgesComponent } from "./scenarioItemBadges/scenarioItemBadges.component"
import { ScenarioItemActionsComponent } from "./scenarioItemActions/scenarioItemActions.component"

@Component({
    selector: "cc-scenario-item",
    templateUrl: "./scenarioItem.component.html",
    imports: [ScenarioItemBadgesComponent, ScenarioItemActionsComponent]
})
export class ScenarioItemComponent {
    readonly view = input.required<ScenarioView>()
    readonly applyRequested = output<void>()
    readonly exportRequested = output<void>()
    readonly deleteRequested = output<void>()
}
