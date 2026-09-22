import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { NodeInteraction, setRightClickedNodeData, unfocusNode } from "../../../stores/sharedView/sharedView.write.facade"

@Injectable({ providedIn: "root" })
export class SunburstMapWriteStore {
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
                value: { nodeId: path, xPositionOfRightClickEvent: clientX, yPositionOfRightClickEvent: clientY, origin: "sunburst" }
            })
        )
    }

    unfocus() {
        this.store.dispatch(unfocusNode())
    }
}
