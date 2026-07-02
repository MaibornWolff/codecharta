import { Injectable } from "@angular/core"
import { Store, State } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { hoveredNodeIdSelector } from "../../../mapState/store/hoveredNodeId/hoveredNodeId.selector"
import { edgeVisibilitySelector } from "../selectors/edgeVisibility.selector"

@Injectable({ providedIn: "root" })
export class CodeMapArrowStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>
    ) {}

    readonly hoveredNodeId$ = this.store.select(hoveredNodeIdSelector)

    getMapState() {
        return this.state.getValue().mapState
    }

    getEdges() {
        return this.state.getValue().fileSettings.edges
    }

    getEdgeVisibility() {
        return edgeVisibilitySelector(this.state.getValue())
    }
}
