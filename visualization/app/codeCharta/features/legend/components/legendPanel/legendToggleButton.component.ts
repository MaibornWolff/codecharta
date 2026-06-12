import { ChangeDetectionStrategy, Component, computed, input, output } from "@angular/core"
import { InspectorVisibilityService } from "../../../sidebarInspector/facade"
import { LEGEND_BARS_OFFSET } from "./legendPosition"

@Component({
    selector: "cc-legend-toggle-button",
    templateUrl: "./legendToggleButton.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" }
})
export class LegendToggleButtonComponent {
    constructor(private readonly inspectorVisibilityService: InspectorVisibilityService) {}

    readonly isOpen = input.required<boolean>()
    readonly togglePanel = output<void>()

    readonly buttonBottom = `calc(${LEGEND_BARS_OFFSET} + 32px)`
    readonly buttonRight = computed(() =>
        this.inspectorVisibilityService.isVisible() ? "calc(var(--cc-inspector-width) - 35px)" : "-35px"
    )
}
