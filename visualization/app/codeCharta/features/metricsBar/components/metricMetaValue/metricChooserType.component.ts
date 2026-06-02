import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core"
import { toObservable, toSignal } from "@angular/core/rxjs-interop"
import { combineLatest, map, switchMap } from "rxjs"
import { AttributeTypes, CodeMapNode, Node, PrimaryMetrics } from "../../../../codeCharta.model"
import { isLeaf } from "../../../../util/codeMapHelper"
import { AttributeTypesService } from "../../services/attributeTypes.service"
import { NodeSelectionService } from "../../services/nodeSelection.service"
import { PrimaryMetricsService } from "../../services/primaryMetrics.service"

@Component({
    selector: "cc-metric-chooser-type",
    templateUrl: "./metricChooserType.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetricChooserTypeComponent {
    private readonly nodeSelectionService = inject(NodeSelectionService)
    private readonly primaryMetricsService = inject(PrimaryMetricsService)
    private readonly attributeTypesService = inject(AttributeTypesService)

    readonly metricFor = input.required<keyof PrimaryMetrics>()
    readonly attributeType = input<keyof AttributeTypes>("nodes")

    readonly node = toSignal(this.nodeSelectionService.createNodeObservable())

    readonly isNodeALeaf = computed(() => {
        const node = this.node()
        if (!node) {
            return false
        }
        if ("isLeaf" in node) {
            return (node as Node).isLeaf
        }
        return isLeaf(node as CodeMapNode)
    })

    private readonly selectorInputs = computed(() => ({ attributeType: this.attributeType(), metricFor: this.metricFor() }))

    readonly attributeTypeLabel = toSignal(
        toObservable(this.selectorInputs).pipe(
            switchMap(({ attributeType, metricFor }) =>
                combineLatest([this.primaryMetricsService.primaryMetricNames$(), this.attributeTypesService.attributeTypes$()]).pipe(
                    map(([primaryMetricNames, attributeTypes]) => {
                        const metricName = primaryMetricNames[metricFor]
                        return attributeTypes[attributeType][metricName] === "relative" ? "x͂" : "Σ"
                    })
                )
            )
        )
    )
}
