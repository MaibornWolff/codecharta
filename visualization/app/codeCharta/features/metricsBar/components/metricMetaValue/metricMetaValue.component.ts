import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { CodeMapNode, Node, PrimaryMetrics } from "../../../../codeCharta.model"
import { NodeSelectionService } from "../../services/nodeSelection.service"
import { PrimaryMetricsService } from "../../services/primaryMetrics.service"
import { MetricChooserTypeComponent } from "./metricChooserType.component"

type DeltaDisplay = {
    label: string
    styleClass: string
}

type MetricDisplay = {
    value: string
    delta: DeltaDisplay | null
}

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
    private readonly primaryMetricNames = toSignal(this.primaryMetricsService.primaryMetricNames$())

    private readonly metricName = computed(() => this.primaryMetricNames()?.[this.metricFor()] ?? null)

    readonly display = computed(() => toMetricDisplay(this.node(), this.metricName(), this.metricFor()))
}

function toMetricDisplay(
    node: CodeMapNode | Node | undefined,
    metricName: string | null,
    metricFor: keyof PrimaryMetrics
): MetricDisplay | null {
    if (!node || !metricName) {
        return null
    }
    return {
        value: formatMetricValue(node, metricName),
        delta: toDeltaDisplay(node, metricName, metricFor)
    }
}

function formatMetricValue(node: CodeMapNode | Node, metricName: string): string {
    const value = node.attributes?.[metricName]
    return typeof value === "number" ? value.toLocaleString() : "—"
}

function toDeltaDisplay(node: CodeMapNode | Node, metricName: string, metricFor: keyof PrimaryMetrics): DeltaDisplay | null {
    if (!("deltas" in node) || !node.deltas) {
        return null
    }
    const delta = node.deltas[metricName]
    if (typeof delta !== "number") {
        return null
    }
    return { label: delta.toLocaleString(), styleClass: deltaStyleClass(delta, metricFor) }
}

function deltaStyleClass(delta: number, metricFor: keyof PrimaryMetrics): string {
    if (metricFor === "heightMetric" && delta > 0) {
        return "text-success"
    }
    if (delta < 0) {
        return "text-error"
    }
    return "text-base-content"
}
