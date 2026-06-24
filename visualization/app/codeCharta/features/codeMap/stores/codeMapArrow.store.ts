import { Injectable } from "@angular/core"
import { Store, State } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { hoveredNodeIdSelector } from "../../../state/store/appStatus/hoveredNodeId/hoveredNodeId.selector"
import { edgeVisibilitySelector } from "../selectors/edgeVisibility.selector"

@Injectable({ providedIn: "root" })
export class CodeMapArrowStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>
    ) {}

    readonly hoveredNodeId$ = this.store.select(hoveredNodeIdSelector)

    getAppSettings() {
        return this.state.getValue().appSettings
    }

    getEdges() {
        return this.state.getValue().fileSettings.edges
    }

    getEdgeVisibility() {
        return edgeVisibilitySelector(this.state.getValue())
    }
}
