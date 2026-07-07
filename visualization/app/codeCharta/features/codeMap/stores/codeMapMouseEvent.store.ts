import { Injectable } from "@angular/core"
import { Store, State } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { visibleFileStatesSelector } from "../../../fileStore/store/visibleFileStates.selector"
import { blacklistSelector, hoveredNodeIdSelector } from "../../../sharedView/sharedView.read.facade"
import { idToNodeSelector } from "../../../renderModel/renderModel.facade"
import { setHoveredNodeId, setRightClickedNodeData } from "../../../sharedView/sharedView.write.facade"

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
