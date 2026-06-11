import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { InspectorComparisonModeService, MetricComparisonMode } from "../../services/inspectorComparisonMode.service"

@Component({
    selector: "cc-inspector-comparison-toggle",
    templateUrl: "./inspectorComparisonToggle.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" }
})
export class InspectorComparisonToggleComponent {
    private readonly comparisonModeService = inject(InspectorComparisonModeService)

    readonly comparisonMode = this.comparisonModeService.comparisonMode

    setComparisonMode(mode: MetricComparisonMode) {
        this.comparisonModeService.setComparisonMode(mode)
    }
}
