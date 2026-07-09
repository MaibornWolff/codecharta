import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import {
    hoveredNodeIdSelector,
    rightClickedNodeDataSelector,
    selectedBuildingIdSelector
} from "../../../stores/sharedView/sharedView.read.facade"
import { setHoveredNodeId, setRightClickedNodeData } from "../../../stores/sharedView/sharedView.write.facade"

type RightClickedNodeData = CcState["sharedView"]["rightClickedNodeData"]

@Injectable({
    providedIn: "root"
})
export class AppStatusStore {
    constructor(private readonly store: Store<CcState>) {}

    hoveredNodeId$ = this.store.select(hoveredNodeIdSelector)
    rightClickedNodeData$ = this.store.select(rightClickedNodeDataSelector)
    selectedBuildingId$ = this.store.select(selectedBuildingIdSelector)

    setHoveredNodeId(value: string | null) {
        this.store.dispatch(setHoveredNodeId({ value }))
    }

    setRightClickedNodeData(value: RightClickedNodeData) {
        this.store.dispatch(setRightClickedNodeData({ value }))
    }
}
