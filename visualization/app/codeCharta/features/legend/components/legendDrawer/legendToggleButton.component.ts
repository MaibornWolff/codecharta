import { ChangeDetectionStrategy, Component, computed, input, output } from "@angular/core"
import { LEGEND_BARS_OFFSET } from "../../models/legendPosition"

@Component({
    selector: "cc-legend-toggle-button",
    templateUrl: "./legendToggleButton.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" }
})
export class LegendToggleButtonComponent {
    readonly isOpen = input.required<boolean>()
    readonly isMovedAsideByInspector = input.required<boolean>()
    readonly togglePanel = output<void>()

    readonly buttonBottom = `calc(${LEGEND_BARS_OFFSET} + 32px)`
    readonly buttonRight = computed(() => (this.isMovedAsideByInspector() ? "calc(var(--cc-inspector-width) - 28px)" : "-28px"))
}
