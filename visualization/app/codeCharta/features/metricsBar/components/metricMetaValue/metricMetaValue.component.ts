import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { CodeMapNode, Node, PrimaryMetrics } from "../../../../codeCharta.model"
import { NodeSelectionService } from "../../services/nodeSelection.service"
import { PrimaryMetricsService } from "../../services/primaryMetrics.service"
import { MetricChooserTypeComponent } from "./metricChooserType.component"

@Component({
    selector: "cc-metric-meta-value",
    templateUrl: "./metricMetaValue.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MetricChooserTypeComponent]
})
export class MetricMetaValueComponent {
    private readonly nodeSelectionService = inject(NodeSelectionService)
    private readonly primaryMetricsService = inject(PrimaryMetricsService)

    readonly metricFor = input.required<keyof PrimaryMetrics>()

    readonly node = toSignal<CodeMapNode | Node | undefined>(this.nodeSelectionService.createNodeObservable())
    readonly primaryMetricNames = toSignal(this.primaryMetricsService.primaryMetricNames$())

    readonly metricName = computed(() => {
        const names = this.primaryMetricNames()
        return names ? names[this.metricFor()] : null
    })

    readonly value = computed(() => {
        const node = this.node()
        const metric = this.metricName()
        if (!node || !metric) {
            return null
        }
        const raw = node.attributes?.[metric]
        return typeof raw === "number" ? raw.toLocaleString() : null
    })

    readonly delta = computed(() => {
        const node = this.node()
        const metric = this.metricName()
        if (!node || !metric || !("deltas" in node) || !node.deltas) {
            return null
        }
        const raw = node.deltas[metric]
        return typeof raw === "number" ? raw : null
    })

    readonly deltaLabel = computed(() => {
        const value = this.delta()
        return value === null ? null : value.toLocaleString()
    })

    readonly deltaClass = computed(() => {
        const value = this.delta()
        if (value === null) {
            return null
        }
        if (this.metricFor() === "heightMetric" && value > 0) {
            return "text-success"
        }
        if (value < 0) {
            return "text-error"
        }
        return "text-base-content"
    })
}
