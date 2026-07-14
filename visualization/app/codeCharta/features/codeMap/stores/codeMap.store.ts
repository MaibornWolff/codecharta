import { Injectable } from "@angular/core"
import { State, Store } from "@ngrx/store"
import { edgesSelector } from "../../../lenses/dependency/dependencyLens.facade"
import { CcState, ColorLabelOptions } from "../../../model/codeCharta.model"
import { idToNodeSelector } from "../../../renderer/renderModel/renderModel.facade"
import { setColorLabels } from "../../../stores/mapState/mapState.write.facade"
import { hoveredNodeIdSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { setHoveredNodeId, setRightClickedNodeData } from "../../../stores/sharedView/sharedView.write.facade"
import { edgeVisibilitySelector } from "../selectors/edgeVisibility.selector"

@Injectable({ providedIn: "root" })
export class CodeMapStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>
    ) {}

    getState(): CcState {
        return this.state.getValue()
    }

    getMapState() {
        return this.state.getValue().mapState
    }

    getEdges() {
        return edgesSelector(this.state.getValue())
    }

    getEdgeVisibility() {
        return edgeVisibilitySelector(this.state.getValue())
    }

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

    setColorLabels(value: Partial<ColorLabelOptions>) {
        this.store.dispatch(setColorLabels({ value }))
    }
}
