import { Injectable, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { ExplorerContextMenu } from "../../../features/sidebarExplorer/facade"
import { CodeMapNode } from "../../../model/codeCharta.model"
import { MapStateReadWindow } from "../../../stores/mapState/mapState.read.facade"
import { SharedViewReadWindow } from "../../../stores/sharedView/sharedView.read.facade"
import { setRightClickedNodeData } from "../../../stores/sharedView/sharedView.write.facade"
import { isAreaValid } from "../../../util/codeMapHelper"

@Injectable()
export class MetricsExplorerContextMenu implements ExplorerContextMenu {
    private readonly store = inject(Store)
    private readonly mapStateReadWindow = inject(MapStateReadWindow)
    private readonly sharedViewReadWindow = inject(SharedViewReadWindow)

    private readonly areaMetric = toSignal(this.mapStateReadWindow.areaMetric$, { requireSync: true })
    private readonly rightClickedNodeData = toSignal(this.sharedViewReadWindow.rightClickedNodeData$, { requireSync: true })

    isEnabledFor(node: CodeMapNode): boolean {
        return isAreaValid(node, this.areaMetric())
    }

    isMarked(node: CodeMapNode): boolean {
        return this.rightClickedNodeData()?.nodeId === node.path
    }

    open(node: CodeMapNode, xPosition: number, yPosition: number): void {
        this.store.dispatch(
            setRightClickedNodeData({
                value: {
                    nodeId: node.path,
                    xPositionOfRightClickEvent: xPosition,
                    yPositionOfRightClickEvent: yPosition,
                    origin: "explorer"
                }
            })
        )
    }

    close(): void {
        this.store.dispatch(setRightClickedNodeData({ value: null }))
    }
}
