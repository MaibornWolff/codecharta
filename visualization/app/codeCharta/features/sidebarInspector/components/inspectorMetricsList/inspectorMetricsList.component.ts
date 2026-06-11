import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { InspectorMetricsService } from "../../services/inspectorMetrics.service"
import { InspectorMetricRowComponent } from "../inspectorMetricRow/inspectorMetricRow.component"

@Component({
    selector: "cc-inspector-metrics-list",
    templateUrl: "./inspectorMetricsList.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [InspectorMetricRowComponent],
    host: { class: "block border-t border-base-300 px-3 py-2" }
})
export class InspectorMetricsListComponent {
    private readonly metricsService = inject(InspectorMetricsService)

    readonly metricRows = toSignal(this.metricsService.metricRows$(), { requireSync: true })
    readonly mapColors = toSignal(this.metricsService.mapColors$(), { requireSync: true })
}
