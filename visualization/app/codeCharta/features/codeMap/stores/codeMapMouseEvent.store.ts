import { Injectable } from "@angular/core"
import { Store, State } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { visibleFileStatesSelector } from "../../../state/selectors/visibleFileStates/visibleFileStates.selector"
import { blacklistSelector } from "../../../state/store/fileSettings/blacklist/blacklist.selector"
import { hoveredNodeIdSelector } from "../../../state/store/appStatus/hoveredNodeId/hoveredNodeId.selector"
import { idToNodeSelector } from "../../../state/selectors/accumulatedData/idToNode.selector"
import { setHoveredNodeId } from "../../../state/store/appStatus/hoveredNodeId/hoveredNodeId.actions"
import { setRightClickedNodeData } from "../../../state/store/appStatus/rightClickedNodeData/rightClickedNodeData.actions"

@Injectable({ providedIn: "root" })
export class CodeMapMouseEventStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>
    ) {}

    readonly visibleFileStates$ = this.store.select(visibleFileStatesSelector)
    readonly blacklist$ = this.store.select(blacklistSelector)
    readonly hoveredNodeId$ = this.store.select(hoveredNodeIdSelector)

    getHoveredNodeId(): number | null {
        return hoveredNodeIdSelector(this.state.getValue())
    }

    getIdToNode() {
        return idToNodeSelector(this.state.getValue())
    }

    setHoveredNodeId(value: number | null) {
        this.store.dispatch(setHoveredNodeId({ value }))
    }

    setRightClickedNodeData(value: CcState["appStatus"]["rightClickedNodeData"]) {
        this.store.dispatch(setRightClickedNodeData({ value }))
    }
}
