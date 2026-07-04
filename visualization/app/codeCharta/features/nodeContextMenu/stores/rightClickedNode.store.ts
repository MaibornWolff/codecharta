import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { rightClickedCodeMapNodeSelector } from "../../../renderModel/renderModel.facade"
import { setRightClickedNodeData } from "../../../sharedView/sharedView.write.facade"
import { rightClickedNodeDataSelector } from "../../../sharedView/sharedView.read.facade"

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
