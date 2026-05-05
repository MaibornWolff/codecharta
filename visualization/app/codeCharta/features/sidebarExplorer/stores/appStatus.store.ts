import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { setHoveredNodeId } from "../../../state/store/appStatus/hoveredNodeId/hoveredNodeId.actions"
import { hoveredNodeIdSelector } from "../../../state/store/appStatus/hoveredNodeId/hoveredNodeId.selector"
import { setRightClickedNodeData } from "../../../state/store/appStatus/rightClickedNodeData/rightClickedNodeData.actions"
import { rightClickedNodeDataSelector } from "../../../state/store/appStatus/rightClickedNodeData/rightClickedNodeData.selector"
import { selectedBuildingIdSelector } from "../../../state/store/appStatus/selectedBuildingId/selectedBuildingId.selector"

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
