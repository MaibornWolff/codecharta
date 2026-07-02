import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState, CodeMapNode } from "../../../codeCharta.model"
import {
    addBlacklistItem,
    addBlacklistItemsIfNotResultsInEmptyMap,
    removeBlacklistItem
} from "../../../sharedView/sharedView.facade"
import { dispatchAfterPaint } from "../../../util/dispatchAfterPaint"

type BlacklistableNode = Pick<CodeMapNode, "path" | "type">

@Injectable({
    providedIn: "root"
})
export class ContextMenuBlacklistStore {
    constructor(private readonly store: Store<CcState>) {}

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
}
