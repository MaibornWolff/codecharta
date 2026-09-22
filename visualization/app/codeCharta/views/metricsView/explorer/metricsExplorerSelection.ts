import { Injectable, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { ExplorerSelection } from "../../../features/sidebarExplorer/facade"
import { CodeMapNode } from "../../../model/codeCharta.model"
import { CodeMapTooltipService } from "../../../renderer/threeViewer/threeViewer.facade"
import { SharedViewReadWindow } from "../../../stores/sharedView/sharedView.read.facade"
import { NodeInteraction } from "../../../stores/sharedView/sharedView.write.facade"

@Injectable()
export class MetricsExplorerSelection implements ExplorerSelection {
    private readonly nodeInteraction = inject(NodeInteraction)
    private readonly sharedViewReadWindow = inject(SharedViewReadWindow)
    private readonly codeMapTooltipService = inject(CodeMapTooltipService)

    private readonly selectedNodePath = toSignal(this.sharedViewReadWindow.selectedNodePath$, { requireSync: true })
    private readonly hoveredNodePath = toSignal(this.sharedViewReadWindow.hoveredNodePath$, { requireSync: true })

    isSelected(node: CodeMapNode): boolean {
        return this.selectedNodePath() === node.path
    }

    isHovered(node: CodeMapNode): boolean {
        return this.hoveredNodePath() === node.path
    }

    select(node: CodeMapNode): void {
        this.nodeInteraction.selectNode(node.path)
    }

    deselect(): void {
        this.nodeInteraction.clearSelection()
    }

    hover(node: CodeMapNode, rowRect: DOMRect): void {
        this.nodeInteraction.hoverNode(node.path)
        this.codeMapTooltipService.show(node, rowRect.right, rowRect.top)
    }

    hoverEnd(): void {
        this.nodeInteraction.hoverNode(null)
        this.codeMapTooltipService.hide()
    }
}
