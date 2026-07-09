import { ChangeDetectionStrategy, Component, input, output } from "@angular/core"
import { ScenarioView } from "../scenarioView.model"
import { ScenarioItemActionsComponent } from "./scenarioItemActions/scenarioItemActions.component"
import { ScenarioItemBadgesComponent } from "./scenarioItemBadges/scenarioItemBadges.component"

@Component({
    selector: "cc-scenario-item",
    templateUrl: "./scenarioItem.component.html",
    imports: [ScenarioItemBadgesComponent, ScenarioItemActionsComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScenarioItemComponent {
    readonly view = input.required<ScenarioView>()
    readonly applyRequested = output<void>()
    readonly exportRequested = output<void>()
    readonly deleteRequested = output<void>()
}
