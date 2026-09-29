import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { MetricsLensFacade } from "../../../../lenses/metrics/metricsLens.facade"
import { AxisCardComponent, MetricSelectPopoverComponent } from "../../../shared/facade"
import { DependencyMapReadStore } from "../../stores/dependencyMap.read.store"
import { DependencyMapWriteStore } from "../../stores/dependencyMap.write.store"

/** The edge metric the graph is drawn for, shared with the Metric view; a click on it opens the list to pick another. */
@Component({
    selector: "cc-edge-metric-segment",
    templateUrl: "./edgeMetricSegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [AxisCardComponent, MetricSelectPopoverComponent]
})
export class EdgeMetricSegmentComponent {
    private readonly readStore = inject(DependencyMapReadStore)
    private readonly writeStore = inject(DependencyMapWriteStore)

    readonly popoverId = "dependency-bar-edge-metric-popover"
    readonly anchorName = "dependency-bar-edge-metric-card"

    readonly edgeMetric = toSignal(this.readStore.sharedEdgeMetric$, { requireSync: true })
    readonly edgeMetricData = toSignal(this.readStore.edgeMetricData$, { requireSync: true })
    readonly descriptors = toSignal(inject(MetricsLensFacade).descriptors$, { initialValue: {} })

    pick(edgeMetric: string): void {
        this.writeStore.setEdgeMetric(edgeMetric)
    }
}
