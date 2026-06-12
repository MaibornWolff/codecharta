import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { rightClickedCodeMapNodeSelector } from "../../../state/selectors/rightClickedCodeMapNode.selector"
import { setRightClickedNodeData } from "../../../state/store/appStatus/rightClickedNodeData/rightClickedNodeData.actions"
import { rightClickedNodeDataSelector } from "../../../state/store/appStatus/rightClickedNodeData/rightClickedNodeData.selector"

@Injectable({
    providedIn: "root"
})
export class RightClickedNodeStore {
    constructor(private readonly store: Store<CcState>) {}

    rightClickedNodeData$ = this.store.select(rightClickedNodeDataSelector)
    rightClickedCodeMapNode$ = this.store.select(rightClickedCodeMapNodeSelector)

    clear() {
        this.store.dispatch(setRightClickedNodeData({ value: null }))
    }
}
