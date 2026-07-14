import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { MapStateReadWindow } from "../../../../stores/mapState/mapState.read.facade"
import { isEmptyMetricRow } from "../../selectors/inspectorMetricRows.selector"
import { InspectorComparisonModeService } from "../../services/inspectorComparisonMode.service"
import { SidebarInspectorReadStore } from "../../stores/sidebarInspector.read.store"
import { InspectorComparisonToggleComponent } from "../inspectorComparisonToggle/inspectorComparisonToggle.component"
import { InspectorEmptyMetricsComponent } from "../inspectorEmptyMetrics/inspectorEmptyMetrics.component"
import { InspectorMetricRowComponent } from "../inspectorMetricRow/inspectorMetricRow.component"

@Component({
    selector: "cc-inspector-metrics-list",
    templateUrl: "./inspectorMetricsList.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [InspectorComparisonToggleComponent, InspectorEmptyMetricsComponent, InspectorMetricRowComponent],
    host: { class: "block border-t border-base-300 px-3 py-2" }
})
export class InspectorMetricsListComponent {
    private readonly readStore = inject(SidebarInspectorReadStore)
    private readonly mapStateReadWindow = inject(MapStateReadWindow)
    private readonly comparisonModeService = inject(InspectorComparisonModeService)

    readonly metricRows = toSignal(this.readStore.metricRows$, { requireSync: true })
    readonly mapColors = toSignal(this.mapStateReadWindow.mapColors$, { requireSync: true })
    readonly comparisonMode = this.comparisonModeService.comparisonMode

    readonly metricRowsWithValues = computed(() => this.metricRows().filter(row => !isEmptyMetricRow(row)))
    readonly emptyMetricRows = computed(() => this.metricRows().filter(row => isEmptyMetricRow(row)))
}
