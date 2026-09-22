import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { edgesSelector } from "../../../lenses/dependency/dependencyLens.facade"
import { CcState, ColorLabelOptions } from "../../../model/codeCharta.model"
import { idToNodeSelector } from "../../../renderer/renderModel/renderModel.facade"
import { isSunburstLayoutSelector, MapStateReadWindow } from "../../../stores/mapState/mapState.read.facade"
import { setColorLabels } from "../../../stores/mapState/mapState.write.facade"
import { CcStateSnapshot } from "../../../stores/rootStore/ccState.snapshot"
import { SharedViewReadWindow } from "../../../stores/sharedView/sharedView.read.facade"
import { NodeInteraction, setRightClickedNodeData } from "../../../stores/sharedView/sharedView.write.facade"
import { edgeVisibilitySelector } from "../selectors/edgeVisibility.selector"

@Injectable({ providedIn: "root" })
export class CodeMapStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly ccStateSnapshot: CcStateSnapshot,
        private readonly mapStateReadWindow: MapStateReadWindow,
        private readonly sharedViewReadWindow: SharedViewReadWindow,
        private readonly nodeInteraction: NodeInteraction
    ) {}

    getState(): CcState {
        return this.ccStateSnapshot.get()
    }

    getMapState() {
        return this.mapStateReadWindow.getMapState()
    }

    getEdges() {
        return edgesSelector(this.ccStateSnapshot.get())
    }

    getEdgeVisibility() {
        return edgeVisibilitySelector(this.ccStateSnapshot.get())
    }

    getHoveredNodeId(): string | null {
        return this.sharedViewReadWindow.getHoveredNodeId()
    }

    getSelectedNodePath(): string | null {
        return this.sharedViewReadWindow.getSelectedNodePath()
    }

    isSunburstLayout(): boolean {
        return isSunburstLayoutSelector(this.ccStateSnapshot.get())
    }

    getIdToNode() {
        return idToNodeSelector(this.ccStateSnapshot.get())
    }

    hoverNode(path: string) {
        this.nodeInteraction.hoverNode(path)
    }

    clearHover() {
        this.nodeInteraction.clearHover()
    }

    setRightClickedNodeData(value: CcState["sharedView"]["rightClickedNodeData"]) {
        this.store.dispatch(setRightClickedNodeData({ value }))
    }

    setColorLabels(value: Partial<ColorLabelOptions>) {
        this.store.dispatch(setColorLabels({ value }))
    }
}
