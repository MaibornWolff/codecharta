import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { IsEdgeMetricVisibleService } from "../../services/isEdgeMetricVisible.service"

@Component({
    selector: "cc-edge-metric-toggle",
    templateUrl: "./edgeMetricToggle.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class EdgeMetricToggleComponent {
    private readonly isEdgeMetricVisibleService = inject(IsEdgeMetricVisibleService)

    readonly isEdgeMetricVisible = toSignal(this.isEdgeMetricVisibleService.isEdgeMetricVisible$(), { initialValue: true })

    toggle() {
        this.isEdgeMetricVisibleService.toggleEdgeMetricVisible()
    }
}
