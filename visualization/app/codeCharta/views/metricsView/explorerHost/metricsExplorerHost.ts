import { Injectable, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { CodeMapMouseEventService } from "../../../features/codeMap/facade"
import { ExplorerHost, ExplorerHostCapabilities, ExplorerRowState, formatCompactNumber } from "../../../features/sidebarExplorer/facade"
import { CodeMapNode } from "../../../model/codeCharta.model"
import { rootUnarySelector } from "../../../renderer/renderModel/renderModel.facade"
import {
    CodeMapTooltipService,
    IdToBuildingService,
    ThreeRendererService,
    ThreeSceneService
} from "../../../renderer/threeViewer/threeViewer.facade"
import { MapStateReadWindow } from "../../../stores/mapState/mapState.read.facade"
import { isAreaValid, isLeaf } from "../../../util/codeMapHelper"

const NO_AREA_HINT = "No Node Area for Chosen Metric"

/**
 * What an explorer row means in the metrics view: a building in the 3D map.
 *
 * Selecting a row selects its building and redraws the scene, hovering it shows the map's metric
 * tooltip, and rows whose node has no area in the current area metric are inert. All of this used to
 * live in the explorer itself, which is why the domain view inherited map semantics it has no use for.
 */
@Injectable()
export class MetricsExplorerHost implements ExplorerHost {
    private readonly mapStateReadWindow = inject(MapStateReadWindow)
    private readonly store = inject(Store)
    private readonly threeSceneService = inject(ThreeSceneService)
    private readonly idToBuildingService = inject(IdToBuildingService)
    private readonly threeRendererService = inject(ThreeRendererService)
    private readonly codeMapMouseEventService = inject(CodeMapMouseEventService)
    private readonly codeMapTooltipService = inject(CodeMapTooltipService)

    private readonly areaMetric = toSignal(this.mapStateReadWindow.areaMetric$, { requireSync: true })
    private readonly buildingIds = toSignal(this.idToBuildingService.buildingIds$, { requireSync: true })
    private readonly rootUnary = toSignal(this.store.select(rootUnarySelector), { requireSync: true })

    readonly capabilities: ExplorerHostCapabilities = {
        showRules: true,
        showSearch: true,
        showCounts: true
    }

    isSelectable(node: CodeMapNode): boolean {
        // A leaf with no building cannot be selected in the scene. Folders stay clickable: they toggle open.
        return !isLeaf(node) || this.buildingIds().has(node.id)
    }

    rowState(node: CodeMapNode): ExplorerRowState {
        const hasArea = isAreaValid(node, this.areaMetric())
        return {
            isDimmed: !hasArea,
            isItalic: !hasArea || !this.isSelectable(node),
            title: hasArea ? "" : NO_AREA_HINT
        }
    }

    rowDecoration(node: CodeMapNode): string | null {
        const unary = node.attributes.unary
        if (isLeaf(node) || unary == null) {
            return null
        }
        const root = this.rootUnary()
        const percentage = root ? Math.round((100 * unary) / root) : 0
        return `${percentage}% / ${formatCompactNumber(unary)}`
    }

    hasContextMenu(node: CodeMapNode): boolean {
        return isAreaValid(node, this.areaMetric())
    }

    onHover(node: CodeMapNode, rowRect: DOMRect): void {
        this.codeMapMouseEventService.hoverNode(node.path)
        this.codeMapTooltipService.show(node, rowRect.right, rowRect.top)
    }

    onHoverEnd(): void {
        this.codeMapMouseEventService.unhoverNode()
        this.codeMapTooltipService.hide()
    }

    onSelect(node: CodeMapNode): void {
        const building = this.idToBuildingService.get(node.id)
        this.codeMapMouseEventService.drawLabelSelectedBuilding(building)
        this.threeSceneService.selectBuilding(building)
        this.threeSceneService.clearConstantHighlight()
        this.threeRendererService.render()
    }

    onDeselect(): void {
        this.threeSceneService.clearSelection()
        this.threeSceneService.clearConstantHighlight()
        this.threeRendererService.render()
    }
}
