import { ChangeDetectionStrategy, Component, computed, inject, input, output } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { MetricsLensFacade } from "../../../../lenses/metrics/metricsLens.facade"
import { MetricSelectPopoverComponent } from "../../../shared/facade"
import { MetricsBarReadStore } from "../../stores/metricsBar.read.store"

type MetricSelectKind = "node" | "edge"

@Component({
    selector: "cc-metric-bar-select-popover",
    templateUrl: "./metricBarSelectPopover.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [MetricSelectPopoverComponent]
})
export class MetricBarSelectPopoverComponent {
    private readonly metricsBarReadStore = inject(MetricsBarReadStore)
    private readonly metricsLensFacade = inject(MetricsLensFacade)

    readonly popoverId = input.required<string>()
    readonly anchorName = input.required<string>()
    readonly placeholder = input("Search metric")
    readonly kind = input<MetricSelectKind>("node")
    readonly selected = input<string | null>(null)
    readonly metricSelected = output<string>()

    private readonly metricData = toSignal(this.metricsBarReadStore.metricData$, {
        initialValue: { nodeMetricData: [], edgeMetricData: [], nodeEdgeMetricsMap: new Map() }
    })
    readonly descriptors = toSignal(this.metricsLensFacade.descriptors$, { initialValue: {} })

    readonly options = computed(() => {
        const metricData = this.metricData()
        return this.kind() === "edge" ? metricData.edgeMetricData : metricData.nodeMetricData
    })
}
