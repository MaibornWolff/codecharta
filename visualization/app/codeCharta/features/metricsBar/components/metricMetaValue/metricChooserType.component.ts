import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core"
import { toObservable, toSignal } from "@angular/core/rxjs-interop"
import { switchMap } from "rxjs"
import { AttributeTypes, CodeMapNode, Node, PrimaryMetrics } from "../../../../model/codeCharta.model"
import { isLeaf } from "../../../../util/codeMapHelper"
import { NodeSelectionService } from "../../services/nodeSelection.service"
import { MetricsBarReadStore } from "../../stores/metricsBar.read.store"

@Component({
    selector: "cc-metric-chooser-type",
    templateUrl: "./metricChooserType.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetricChooserTypeComponent {
    private readonly nodeSelectionService = inject(NodeSelectionService)
    private readonly metricsBarReadStore = inject(MetricsBarReadStore)

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
            switchMap(({ attributeType, metricFor }) => this.metricsBarReadStore.attributeTypeLabel$(attributeType, metricFor))
        )
    )
}
