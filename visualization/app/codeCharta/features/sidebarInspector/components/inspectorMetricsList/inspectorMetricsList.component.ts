import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { isEmptyMetricRow } from "../../selectors/inspectorMetricRows.selector"
import { InspectorComparisonModeService, MetricComparisonMode } from "../../services/inspectorComparisonMode.service"
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
    private readonly comparisonModeService = inject(InspectorComparisonModeService)

    readonly metricRows = toSignal(this.metricsService.metricRows$(), { requireSync: true })
    readonly mapColors = toSignal(this.metricsService.mapColors$(), { requireSync: true })
    readonly comparisonMode = this.comparisonModeService.comparisonMode

    readonly metricRowsWithValues = computed(() => this.metricRows().filter(row => !isEmptyMetricRow(row)))
    readonly emptyMetricRows = computed(() => this.metricRows().filter(row => isEmptyMetricRow(row)))

    readonly showEmptyMetrics = signal(false)

    setComparisonMode(mode: MetricComparisonMode) {
        this.comparisonModeService.setComparisonMode(mode)
    }

    toggleEmptyMetrics() {
        this.showEmptyMetrics.update(value => !value)
    }
}
