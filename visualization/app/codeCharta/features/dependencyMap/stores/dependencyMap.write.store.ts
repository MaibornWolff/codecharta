import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { setEdgeMetric } from "../../../stores/mapState/mapState.write.facade"
import { NodeInteraction, setRightClickedNodeData } from "../../../stores/sharedView/sharedView.write.facade"

@Injectable({ providedIn: "root" })
export class DependencyMapWriteStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly nodeInteraction: NodeInteraction
    ) {}

    selectNode(path: string) {
        this.nodeInteraction.selectNode(path)
    }

    hoverNode(path: string | null) {
        this.nodeInteraction.hoverNode(path)
    }

    openContextMenu(path: string, clientX: number, clientY: number) {
        this.store.dispatch(
            setRightClickedNodeData({
                value: { nodeId: path, xPositionOfRightClickEvent: clientX, yPositionOfRightClickEvent: clientY, origin: "dependencyMap" }
            })
        )
    }

    setEdgeMetric(edgeMetric: string) {
        this.store.dispatch(setEdgeMetric({ value: edgeMetric }))
    }
}
