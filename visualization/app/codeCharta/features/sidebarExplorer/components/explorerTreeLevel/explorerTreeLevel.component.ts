import { NgClass } from "@angular/common"
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, OnInit, signal } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { CodeMapNode } from "../../../../codeCharta.model"
import { IdToBuildingService } from "../../../../services/idToBuilding/idToBuilding.service"
import { CodeMapMouseEventService } from "../../../../ui/codeMap/codeMap.mouseEvent.service"
import { ThreeRendererService } from "../../../../ui/codeMap/threeViewer/threeRenderer.service"
import { ThreeSceneService } from "../../../../ui/codeMap/threeViewer/threeSceneService"
import { isAreaValid, isLeaf } from "../../../../util/codeMapHelper"
import { formatCompactNumber } from "../../../../util/formatCompactNumber"
import { AppStatusStore } from "../../stores/appStatus.store"
import { AreaMetricStore } from "../../stores/areaMetric.store"
import { RootUnaryStore } from "../../stores/rootUnary.store"
import { ExplorerTreeItemIconComponent } from "../explorerTreeItemIcon/explorerTreeItemIcon.component"
import { ExplorerTreeItemNameComponent } from "../explorerTreeItemName/explorerTreeItemName.component"

@Component({
    selector: "cc-explorer-tree-level",
    templateUrl: "./explorerTreeLevel.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass, ExplorerTreeItemIconComponent, ExplorerTreeItemNameComponent]
})
export class ExplorerTreeLevelComponent implements OnInit {
    private readonly appStatusStore = inject(AppStatusStore)
    private readonly areaMetricStore = inject(AreaMetricStore)
    private readonly rootUnaryStore = inject(RootUnaryStore)
    private readonly threeSceneService = inject(ThreeSceneService)
    private readonly idToBuildingService = inject(IdToBuildingService)
    private readonly threeRendererService = inject(ThreeRendererService)
    private readonly codeMapMouseEventService = inject(CodeMapMouseEventService)
    private readonly destroyRef = inject(DestroyRef)

    private isScrollListenerRegistered = false

    readonly node = input.required<CodeMapNode>()
    readonly depth = input.required<number>()

    readonly isOpen = signal(false)

    readonly hoveredNodeId = toSignal(this.appStatusStore.hoveredNodeId$, { requireSync: true })
    readonly rightClickedNodeData = toSignal(this.appStatusStore.rightClickedNodeData$, { requireSync: true })
    readonly selectedBuildingId = toSignal(this.appStatusStore.selectedBuildingId$, { requireSync: true })
    readonly areaMetric = toSignal(this.areaMetricStore.areaMetric$, { requireSync: true })
    readonly rootUnary = toSignal(this.rootUnaryStore.rootUnary$, { requireSync: true })
    readonly buildingIds = toSignal(this.idToBuildingService.buildingIds$, { requireSync: true })

    readonly isHovered = computed(() => this.hoveredNodeId() === this.node().id)
    readonly isMarked = computed(() => this.rightClickedNodeData()?.nodeId === this.node().id)
    readonly isSelected = computed(() => this.selectedBuildingId() === this.node().id)
    readonly isAreaMetricValid = computed(() => isAreaValid(this.node(), this.areaMetric()))
    readonly isLeafNode = computed(() => isLeaf(this.node()))
    readonly children = computed(() => this.node().children ?? [])
    readonly isUnclickable = computed(() => this.isLeafNode() && !this.buildingIds().has(this.node().id))
    readonly unaryPercentage = computed(() => {
        const unary = this.node().attributes.unary
        const root = this.rootUnary()
        if (unary == null || !root) {
            return 0
        }
        return Math.round((100 * unary) / root)
    })
    readonly unaryDisplay = computed(() => formatCompactNumber(this.node().attributes.unary))

    ngOnInit(): void {
        this.isOpen.set(this.depth() === 0)
        this.destroyRef.onDestroy(() => this.removeScrollListener())
    }

    onMouseEnter() {
        this.codeMapMouseEventService.hoverNode(this.node().id)
        this.appStatusStore.setHoveredNodeId(this.node().id)
    }

    onMouseLeave() {
        this.codeMapMouseEventService.unhoverNode()
        this.appStatusStore.setHoveredNodeId(null)
    }

    onClick() {
        if (this.isLeafNode() && this.isUnclickable()) {
            return
        }
        const willBeOpen = !this.isOpen()
        this.isOpen.set(willBeOpen)
        if (this.isLeafNode() || willBeOpen) {
            const building = this.idToBuildingService.get(this.node().id)
            this.codeMapMouseEventService.drawLabelSelectedBuilding(building)
            this.threeSceneService.selectBuilding(building)
        } else {
            this.threeSceneService.clearSelection()
        }
        this.threeSceneService.clearConstantHighlight()
        this.threeRendererService.render()
    }

    openNodeContextMenu = ($event: MouseEvent) => {
        $event.preventDefault()
        $event.stopPropagation()

        if (!this.isAreaMetricValid()) {
            return
        }

        this.appStatusStore.setRightClickedNodeData({
            nodeId: this.node().id,
            xPositionOfRightClickEvent: $event.clientX,
            yPositionOfRightClickEvent: $event.clientY
        })

        this.addScrollListener()
    }

    private addScrollListener() {
        if (this.isScrollListenerRegistered) {
            return
        }
        // The overflow container in sidebarExplorer.component.html is the actual scroll
        // host; scroll events do not bubble from the overflow parent down to children,
        // so we listen on the container itself to dismiss the menu on any user scroll.
        document.querySelector("#explorer-scroll")?.addEventListener("scroll", this.scrollFunction)
        this.isScrollListenerRegistered = true
    }

    private removeScrollListener() {
        if (!this.isScrollListenerRegistered) {
            return
        }
        document.querySelector("#explorer-scroll")?.removeEventListener("scroll", this.scrollFunction)
        this.isScrollListenerRegistered = false
    }

    private scrollFunction = () => {
        this.appStatusStore.setRightClickedNodeData(null)
        this.removeScrollListener()
    }
}
