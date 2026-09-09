import { ChangeDetectionStrategy, Component, input } from "@angular/core"
import { SCENARIO_GROUP_ICONS, SCENARIO_GROUP_LABELS } from "../../../../model/scenarioSettings.registry"
import { ScenarioView } from "../../../../model/scenarioView.model"

@Component({
    selector: "cc-scenario-item-badges",
    templateUrl: "./scenarioItemBadges.component.html",
    host: { class: "block overflow-hidden" },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScenarioItemBadgesComponent {
    readonly view = input.required<ScenarioView>()

    readonly groupLabels = SCENARIO_GROUP_LABELS
    readonly groupIcons = SCENARIO_GROUP_ICONS
}
