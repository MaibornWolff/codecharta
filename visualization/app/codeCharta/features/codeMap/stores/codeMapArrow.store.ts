import { Injectable } from "@angular/core"
import { Store, State } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { hoveredNodeIdSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { edgesSelector } from "../../../lenses/dependency/dependencyLens.facade"
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
        return edgesSelector(this.state.getValue())
    }

    getEdgeVisibility() {
        return edgeVisibilitySelector(this.state.getValue())
    }
}
