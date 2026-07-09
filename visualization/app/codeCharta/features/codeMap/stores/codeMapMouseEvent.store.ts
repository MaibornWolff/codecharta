import { Injectable } from "@angular/core"
import { State, Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { idToNodeSelector } from "../../../renderer/renderModel/renderModel.facade"
import { visibleFileStatesSelector } from "../../../stores/fileStore/fileStore.facade"
import { blacklistSelector, hoveredNodeIdSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { setHoveredNodeId, setRightClickedNodeData } from "../../../stores/sharedView/sharedView.write.facade"

@Injectable({ providedIn: "root" })
export class CodeMapMouseEventStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>
    ) {}

    readonly visibleFileStates$ = this.store.select(visibleFileStatesSelector)
    readonly blacklist$ = this.store.select(blacklistSelector)
    readonly hoveredNodeId$ = this.store.select(hoveredNodeIdSelector)

    getHoveredNodeId(): string | null {
        return hoveredNodeIdSelector(this.state.getValue())
    }

    getIdToNode() {
        return idToNodeSelector(this.state.getValue())
    }

    setHoveredNodeId(value: string | null) {
        this.store.dispatch(setHoveredNodeId({ value }))
    }

    setRightClickedNodeData(value: CcState["sharedView"]["rightClickedNodeData"]) {
        this.store.dispatch(setRightClickedNodeData({ value }))
    }
}
