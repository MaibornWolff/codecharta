import { Injectable, inject } from "@angular/core"
import { Router } from "@angular/router"
import { Store } from "@ngrx/store"
import { CcState, CodeMapNode } from "../../../model/codeCharta.model"
import { routeLinks, ViewId } from "../../../routing/routePaths"
import { ViewHandoffStore } from "../../../routing/viewHandoff.store"
import {
    addExcludedNodesIfNotResultsInEmptyMap,
    addFlattenedNodes,
    focusNode,
    markPackages,
    removeFlattenedNodes,
    setRightClickedNodeData,
    unfocusAllNodes,
    unfocusNode,
    unmarkPackage
} from "../../../stores/sharedView/sharedView.write.facade"
import { dispatchRuleChange } from "../../../util/dispatchAfterPaint"

type RuleableNode = Pick<CodeMapNode, "path" | "type">

@Injectable({
    providedIn: "root"
})
export class NodeContextMenuWriteStore {
    private readonly router = inject(Router)
    private readonly viewHandoffStore = inject(ViewHandoffStore)

    constructor(private readonly store: Store<CcState>) {}

    showNodeInView(view: ViewId, nodePath: string) {
        this.viewHandoffStore.handOverNode(view, nodePath)
        void this.router.navigateByUrl(routeLinks[view])
    }

    focus(path: string) {
        this.store.dispatch(focusNode({ value: path }))
    }

    unfocus() {
        this.store.dispatch(unfocusNode())
    }

    unfocusAll() {
        this.store.dispatch(unfocusAllNodes())
    }

    flattenNode(node: RuleableNode) {
        dispatchRuleChange(this.store, "flatten", addFlattenedNodes({ items: [{ path: node.path, nodeType: node.type }] }))
    }

    unflattenNode(node: RuleableNode) {
        dispatchRuleChange(this.store, "flatten", removeFlattenedNodes({ items: [{ path: node.path, nodeType: node.type }] }))
    }

    excludeNode(node: RuleableNode) {
        dispatchRuleChange(
            this.store,
            "exclude",
            addExcludedNodesIfNotResultsInEmptyMap({ items: [{ path: node.path, nodeType: node.type }] })
        )
    }

    markFolder(path: string, color: string) {
        this.store.dispatch(markPackages({ packages: [{ path, color }] }))
    }

    unmarkFolder(path: string) {
        this.store.dispatch(unmarkPackage({ path }))
    }

    openMenuForExplorerRow(nodePath: string, xPosition: number, yPosition: number) {
        this.store.dispatch(
            setRightClickedNodeData({
                value: {
                    nodeId: nodePath,
                    xPositionOfRightClickEvent: xPosition,
                    yPositionOfRightClickEvent: yPosition,
                    origin: "explorer"
                }
            })
        )
    }

    closeMenu() {
        this.store.dispatch(setRightClickedNodeData({ value: null }))
    }
}
