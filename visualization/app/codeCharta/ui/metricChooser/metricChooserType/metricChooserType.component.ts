import { Component, Input, OnInit, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable, map } from "rxjs"
import { PrimaryMetrics, CcState, Node, CodeMapNode, AttributeTypes } from "../../../codeCharta.model"
import { createAttributeTypeSelector } from "./createAttributeTypeSelector.selector"
import { NodeSelectionService } from "../nodeSelection.service"
import { isLeaf } from "../../../util/codeMapHelper"

@Component({
    selector: "cc-metric-chooser-type",
    templateUrl: "./metricChooserType.component.html",
    encapsulation: ViewEncapsulation.None
})
export class MetricChooserTypeComponent implements OnInit {
    @Input({ required: true }) metricFor: keyof PrimaryMetrics
    @Input() attributeType: keyof AttributeTypes = "nodes"

    isNodeALeaf$: Observable<boolean>
    attributeType$: Observable<string>

    constructor(
        private store: Store<CcState>,
        private nodeSelectionService: NodeSelectionService
    ) {}

    ngOnInit(): void {
        this.isNodeALeaf$ = this.nodeSelectionService.createNodeObservable().pipe(map((node: Node | CodeMapNode) => this.isNodeALeaf(node)))
        this.attributeType$ = this.store.select(createAttributeTypeSelector(this.attributeType, this.metricFor))
    }

    private isNodeALeaf = (node: CodeMapNode | Node) => {
        if (!node) {
            return
        }
        if (this.isNode(node)) {
            return (node as Node).isLeaf
        }
        return isLeaf(node as CodeMapNode)
    }

    private isNode(node: CodeMapNode | Node) {
        return "isLeaf" in node
    }
}
