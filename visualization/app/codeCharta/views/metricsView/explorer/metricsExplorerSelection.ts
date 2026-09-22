import { Injectable, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { CodeMapMouseEventService } from "../../../features/codeMap/facade"
import { ExplorerSelection } from "../../../features/sidebarExplorer/facade"
import { CodeMapNode } from "../../../model/codeCharta.model"
import {
    CodeMapTooltipService,
    IdToBuildingService,
    ThreeRendererService,
    ThreeSceneService
} from "../../../renderer/threeViewer/threeViewer.facade"
import { SharedViewReadWindow } from "../../../stores/sharedView/sharedView.read.facade"
import { NodeInteraction } from "../../../stores/sharedView/sharedView.write.facade"

@Injectable()
export class MetricsExplorerSelection implements ExplorerSelection {
    private readonly nodeInteraction = inject(NodeInteraction)
    private readonly sharedViewReadWindow = inject(SharedViewReadWindow)
    private readonly threeSceneService = inject(ThreeSceneService)
    private readonly idToBuildingService = inject(IdToBuildingService)
    private readonly threeRendererService = inject(ThreeRendererService)
    private readonly codeMapMouseEventService = inject(CodeMapMouseEventService)
    private readonly codeMapTooltipService = inject(CodeMapTooltipService)

    private readonly selectedNodePath = toSignal(this.sharedViewReadWindow.selectedNodePath$, { requireSync: true })
    private readonly hoveredNodeId = toSignal(this.sharedViewReadWindow.hoveredNodeId$, { requireSync: true })

    isSelected(node: CodeMapNode): boolean {
        return this.selectedNodePath() === node.path
    }

    isHovered(node: CodeMapNode): boolean {
        return this.hoveredNodeId() === node.path
    }

    select(node: CodeMapNode): void {
        this.nodeInteraction.selectNode(node.path)
        const building = this.idToBuildingService.get(node.id)
        this.codeMapMouseEventService.drawLabelSelectedBuilding(building)
        this.threeSceneService.selectBuilding(building)
        this.threeSceneService.clearConstantHighlight()
        this.threeRendererService.render()
    }

    deselect(): void {
        this.nodeInteraction.clearSelection()
        this.threeSceneService.clearSelection()
        this.threeSceneService.clearConstantHighlight()
        this.threeRendererService.render()
    }

    hover(node: CodeMapNode, rowRect: DOMRect): void {
        this.nodeInteraction.hoverNode(node.path)
        this.codeMapMouseEventService.hoverNode(node.path)
        this.codeMapTooltipService.show(node, rowRect.right, rowRect.top)
    }

    hoverEnd(): void {
        this.nodeInteraction.clearHover()
        this.codeMapMouseEventService.unhoverNode()
        this.codeMapTooltipService.hide()
    }
}
