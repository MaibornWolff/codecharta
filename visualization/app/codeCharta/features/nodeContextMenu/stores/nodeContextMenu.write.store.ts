import { Injectable, inject } from "@angular/core"
import { Router } from "@angular/router"
import { Store } from "@ngrx/store"
import { CcState, CodeMapNode } from "../../../model/codeCharta.model"
import { routeLinks, ViewId } from "../../../routing/routePaths"
import { ViewHandoffStore } from "../../../routing/viewHandoff.store"
import {
    addBlacklistItem,
    addBlacklistItemsIfNotResultsInEmptyMap,
    focusNode,
    markPackages,
    removeBlacklistItem,
    setRightClickedNodeData,
    unfocusAllNodes,
    unfocusNode,
    unmarkPackage
} from "../../../stores/sharedView/sharedView.write.facade"
import { dispatchAfterPaint } from "../../../util/dispatchAfterPaint"

type BlacklistableNode = Pick<CodeMapNode, "path" | "type">

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

    flattenNode(node: BlacklistableNode) {
        dispatchAfterPaint(this.store, addBlacklistItem({ item: { path: node.path, type: "flatten", nodeType: node.type } }))
    }

    unflattenNode(node: BlacklistableNode) {
        dispatchAfterPaint(this.store, removeBlacklistItem({ item: { path: node.path, type: "flatten", nodeType: node.type } }))
    }

    excludeNode(node: BlacklistableNode) {
        dispatchAfterPaint(
            this.store,
            addBlacklistItemsIfNotResultsInEmptyMap({ items: [{ path: node.path, type: "exclude", nodeType: node.type }] })
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
