import { Injectable, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { DependencyMapViewStore } from "../../../features/dependencyMap/facade"
import { ExplorerSelection } from "../../../features/sidebarExplorer/facade"
import { CodeMapNode } from "../../../model/codeCharta.model"
import { SharedViewReadWindow } from "../../../stores/sharedView/sharedView.read.facade"
import { NodeInteraction } from "../../../stores/sharedView/sharedView.write.facade"

@Injectable()
export class DependencyExplorerSelection implements ExplorerSelection {
    private readonly nodeInteraction = inject(NodeInteraction)
    private readonly sharedViewReadWindow = inject(SharedViewReadWindow)
    private readonly viewStore = inject(DependencyMapViewStore)

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
        this.viewStore.reveal(node.path)
    }

    deselect(): void {
        this.nodeInteraction.clearSelection()
    }

    hover(node: CodeMapNode): void {
        this.nodeInteraction.hoverNode(node.path)
    }

    hoverEnd(): void {
        this.nodeInteraction.hoverNode(null)
    }
}
