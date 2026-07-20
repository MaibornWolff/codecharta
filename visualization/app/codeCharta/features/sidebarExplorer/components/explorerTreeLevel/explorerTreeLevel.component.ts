import { NgClass } from "@angular/common"
import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, input, OnInit, signal } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { CodeMapNode } from "../../../../model/codeCharta.model"
import { SharedViewReadWindow } from "../../../../stores/sharedView/sharedView.read.facade"
import { isLeaf } from "../../../../util/codeMapHelper"
import { EXPLORER_HOST } from "../../explorerHost"
import { scrollRowIntoViewWhenRendered } from "../../scrollRowIntoView"
import { ExplorerRevealService } from "../../services/explorerReveal.service"
import { SidebarExplorerWriteStore } from "../../stores/sidebarExplorer.write.store"
import { ExplorerTreeItemIconComponent } from "../explorerTreeItemIcon/explorerTreeItemIcon.component"
import { ExplorerTreeItemNameComponent } from "../explorerTreeItemName/explorerTreeItemName.component"

@Component({
    selector: "cc-explorer-tree-level",
    templateUrl: "./explorerTreeLevel.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass, ExplorerTreeItemIconComponent, ExplorerTreeItemNameComponent]
})
export class ExplorerTreeLevelComponent implements OnInit {
    private readonly sharedViewReadWindow = inject(SharedViewReadWindow)
    private readonly writeStore = inject(SidebarExplorerWriteStore)
    private readonly host = inject(EXPLORER_HOST)
    private readonly revealService = inject(ExplorerRevealService)
    private readonly destroyRef = inject(DestroyRef)

    private isScrollListenerRegistered = false

    readonly node = input.required<CodeMapNode>()
    readonly depth = input.required<number>()

    readonly isOpen = signal(false)

    readonly hoveredNodeId = toSignal(this.sharedViewReadWindow.hoveredNodeId$, { requireSync: true })
    readonly rightClickedNodeData = toSignal(this.sharedViewReadWindow.rightClickedNodeData$, { requireSync: true })
    readonly selectedBuildingId = toSignal(this.sharedViewReadWindow.selectedBuildingId$, { requireSync: true })

    readonly isHovered = computed(() => this.hoveredNodeId() === this.node().path)
    readonly isMarked = computed(() => this.rightClickedNodeData()?.nodeId === this.node().path)
    readonly isRevealed = computed(() => this.revealService.revealedNodePath() === this.node().path)
    readonly isSelected = computed(() => this.selectedBuildingId() === this.node().path)
    readonly isLeafNode = computed(() => isLeaf(this.node()))
    readonly children = computed(() => this.node().children ?? [])

    // Everything view-specific comes from the host, so this component stays free of map/domain concepts.
    readonly rowState = computed(() => this.host.rowState(this.node()))
    readonly rowDecoration = computed(() => this.host.rowDecoration(this.node()))
    readonly isSelectable = computed(() => this.host.isSelectable(this.node()))
    readonly hasContextMenu = computed(() => this.host.hasContextMenu(this.node()))

    // Opens this level when a node below it gets revealed; the target level itself scrolls into view.
    private readonly revealEffect = effect(() => {
        const revealedNodePath = this.revealService.revealedNodePath()
        if (!revealedNodePath) {
            return
        }
        const path = this.node().path
        if (revealedNodePath.startsWith(`${path}/`)) {
            this.isOpen.set(true)
        }
        if (revealedNodePath === path) {
            scrollRowIntoViewWhenRendered(path, () => this.revealService.revealedNodePath() === path)
        }
    })

    ngOnInit(): void {
        this.isOpen.set(this.depth() === 0)
        this.destroyRef.onDestroy(() => this.removeScrollListener())
    }

    onMouseEnter($event: MouseEvent) {
        this.writeStore.setHoveredNodeId(this.node().path)
        const rowRect = ($event.currentTarget as HTMLElement).getBoundingClientRect()
        this.host.onHover(this.node(), rowRect)
    }

    onMouseLeave() {
        this.writeStore.setHoveredNodeId(null)
        this.host.onHoverEnd()
    }

    onClick() {
        if (!this.isSelectable()) {
            return
        }
        const willBeOpen = !this.isOpen()
        this.isOpen.set(willBeOpen)
        if (this.isLeafNode() || willBeOpen) {
            // Publish the selection by path first: this is what drives consumers such as the domain word
            // cloud, and it works in views with no 3D map. The host then adds whatever selection means to it.
            this.writeStore.setSelectedBuildingId(this.node().path)
            this.host.onSelect(this.node())
        } else {
            this.writeStore.setSelectedBuildingId(null)
            this.host.onDeselect()
        }
    }

    openNodeContextMenu = ($event: MouseEvent) => {
        // Return before preventDefault so a view without a context menu (the domain view) leaves the
        // event untouched rather than swallowing it into a menu that is never rendered.
        if (!this.hasContextMenu()) {
            return
        }

        $event.preventDefault()
        $event.stopPropagation()

        this.writeStore.setRightClickedNodeData({
            nodeId: this.node().path,
            xPositionOfRightClickEvent: $event.clientX,
            yPositionOfRightClickEvent: $event.clientY,
            origin: "explorer"
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

    private readonly scrollFunction = () => {
        this.writeStore.setRightClickedNodeData(null)
        this.removeScrollListener()
    }
}
