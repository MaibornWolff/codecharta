import { Component, input, output } from "@angular/core"

@Component({
    selector: "cc-scenario-item-actions",
    templateUrl: "./scenarioItemActions.component.html"
})
export class ScenarioItemActionsComponent {
    readonly isBuiltIn = input.required<boolean>()
    readonly exportRequested = output<void>()
    readonly deleteRequested = output<void>()
}
