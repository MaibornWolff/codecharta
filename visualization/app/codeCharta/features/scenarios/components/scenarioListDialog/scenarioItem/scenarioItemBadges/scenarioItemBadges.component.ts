import { Component, input } from "@angular/core"
import { SCENARIO_SECTION_ICONS, SCENARIO_SECTION_LABELS } from "../../../../model/scenario.model"
import { ScenarioView } from "../../scenarioView.model"

@Component({
    selector: "cc-scenario-item-badges",
    templateUrl: "./scenarioItemBadges.component.html",
    host: { class: "block overflow-hidden" }
})
export class ScenarioItemBadgesComponent {
    readonly view = input.required<ScenarioView>()

    readonly sectionLabels = SCENARIO_SECTION_LABELS
    readonly sectionIcons = SCENARIO_SECTION_ICONS
}
