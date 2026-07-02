import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { setHoveredNodeId } from "../../../mapState/store/hoveredNodeId/hoveredNodeId.actions"
import { hoveredNodeIdSelector } from "../../../mapState/store/hoveredNodeId/hoveredNodeId.selector"
import { setRightClickedNodeData } from "../../../mapState/store/rightClickedNodeData/rightClickedNodeData.actions"
import { rightClickedNodeDataSelector } from "../../../mapState/store/rightClickedNodeData/rightClickedNodeData.selector"
import { selectedBuildingIdSelector } from "../../../mapState/store/selectedBuildingId/selectedBuildingId.selector"

type RightClickedNodeData = CcState["appStatus"]["rightClickedNodeData"]

@Injectable({
    providedIn: "root"
})
export class AppStatusStore {
    constructor(private readonly store: Store<CcState>) {}

    hoveredNodeId$ = this.store.select(hoveredNodeIdSelector)
    rightClickedNodeData$ = this.store.select(rightClickedNodeDataSelector)
    selectedBuildingId$ = this.store.select(selectedBuildingIdSelector)

    setHoveredNodeId(value: null | number) {
        this.store.dispatch(setHoveredNodeId({ value }))
    }

    setRightClickedNodeData(value: RightClickedNodeData) {
        this.store.dispatch(setRightClickedNodeData({ value }))
    }
}
