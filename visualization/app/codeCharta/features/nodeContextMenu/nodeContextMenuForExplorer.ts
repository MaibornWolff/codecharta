import { Injectable, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { CodeMapNode } from "../../model/codeCharta.model"
import { SharedViewReadWindow } from "../../stores/sharedView/sharedView.read.facade"
import { ExplorerContextMenu } from "../sidebarExplorer/facade"
import { NodeContextMenuWriteStore } from "./stores/nodeContextMenu.write.store"

/** Opens the node context menu from an explorer row. Views whose menu only offers node-independent
 * actions can provide this as is; the others narrow `isEnabledFor` to the rows they act on. */
@Injectable()
export class NodeContextMenuForExplorer implements ExplorerContextMenu {
    private readonly writeStore = inject(NodeContextMenuWriteStore)
    private readonly rightClickedNodeData = toSignal(inject(SharedViewReadWindow).rightClickedNodeData$, { requireSync: true })

    isEnabledFor(_node: CodeMapNode): boolean {
        return true
    }

    isMarked(node: CodeMapNode): boolean {
        return this.rightClickedNodeData()?.nodeId === node.path
    }

    open(node: CodeMapNode, xPosition: number, yPosition: number): void {
        this.writeStore.openMenuForExplorerRow(node.path, xPosition, yPosition)
    }

    close(): void {
        this.writeStore.closeMenu()
    }
}
