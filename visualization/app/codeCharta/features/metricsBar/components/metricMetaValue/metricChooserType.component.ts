import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { switchMap } from "rxjs"
import { toObservable } from "@angular/core/rxjs-interop"
import { AttributeTypes, CcState, CodeMapNode, Node, PrimaryMetrics } from "../../../../codeCharta.model"
import { isLeaf } from "../../../../util/codeMapHelper"
import { NodeSelectionService } from "../../services/nodeSelection.service"
import { createAttributeTypeSelector } from "./createAttributeTypeSelector.selector"

@Component({
    selector: "cc-metric-chooser-type",
    templateUrl: "./metricChooserType.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetricChooserTypeComponent {
    private readonly store = inject(Store<CcState>)
    private readonly nodeSelectionService = inject(NodeSelectionService)

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
            switchMap(({ attributeType, metricFor }) => this.store.select(createAttributeTypeSelector(attributeType, metricFor)))
        )
    )
}
