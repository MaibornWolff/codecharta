import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { MapStateReadWindow } from "../../../../stores/mapState/mapState.read.facade"
import { MetricsBarWriteStore } from "../../stores/metricsBar.write.store"

@Component({
    selector: "cc-edge-metric-toggle",
    templateUrl: "./edgeMetricToggle.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class EdgeMetricToggleComponent {
    private readonly mapStateReadWindow = inject(MapStateReadWindow)
    private readonly metricsBarWriteStore = inject(MetricsBarWriteStore)

    readonly isEdgeMetricVisible = toSignal(this.mapStateReadWindow.isEdgeMetricVisible$, { initialValue: true })

    toggle() {
        this.metricsBarWriteStore.toggleEdgeMetricVisible()
    }
}
