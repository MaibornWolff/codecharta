import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState, CodeMapNode } from "../../../model/codeCharta.model"
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
    constructor(private readonly store: Store<CcState>) {}

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

    closeMenu() {
        this.store.dispatch(setRightClickedNodeData({ value: null }))
    }
}
