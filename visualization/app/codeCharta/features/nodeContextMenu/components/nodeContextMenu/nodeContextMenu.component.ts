import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, HostListener, inject, signal, viewChild } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { CodeMapNode } from "../../../../codeCharta.model"
import { IdToBuildingService } from "../../../../services/idToBuilding/idToBuilding.service"
import { ThreeSceneService } from "../../../../features/codeMap/facade"
import { ExplorerRevealService } from "../../../sidebarExplorer/facade"
import { ContextMenuBlacklistStore } from "../../stores/contextMenuBlacklist.store"
import { FocusedNodeStore } from "../../stores/focusedNode.store"
import { RightClickedNodeStore } from "../../stores/rightClickedNode.store"
import { ContextMenuItemComponent } from "./contextMenuItem.component"
import { MarkFolderRowComponent } from "./markFolderRow.component"

const VIEWPORT_MARGIN = 4
const PATH_COPIED_FEEDBACK_DURATION_MS = 1500

@Component({
    selector: "cc-node-context-menu",
    templateUrl: "./nodeContextMenu.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ContextMenuItemComponent, MarkFolderRowComponent]
})
export class NodeContextMenuComponent {
    private readonly rightClickedNodeStore = inject(RightClickedNodeStore)
    private readonly focusedNodeStore = inject(FocusedNodeStore)
    private readonly blacklistStore = inject(ContextMenuBlacklistStore)
    private readonly threeSceneService = inject(ThreeSceneService)
    private readonly idToBuildingService = inject(IdToBuildingService)
    private readonly explorerRevealService = inject(ExplorerRevealService)

    private readonly menuRef = viewChild<ElementRef<HTMLElement>>("menu")
    private pathCopiedTimeout: ReturnType<typeof setTimeout> | null = null
    private clampAnimationFrameId: number | null = null

    readonly rightClickedNodeData = toSignal(this.rightClickedNodeStore.rightClickedNodeData$, { requireSync: true })
    readonly codeMapNode = toSignal(this.rightClickedNodeStore.rightClickedCodeMapNode$, { requireSync: true })
    readonly currentFocusedNodePath = toSignal(this.focusedNodeStore.currentFocusedNodePath$, { requireSync: true })
    readonly hasPreviousFocusedNodePath = toSignal(this.focusedNodeStore.hasPreviousFocusedNodePath$, { requireSync: true })

    // null until the rendered menu was measured and clamped to the viewport
    readonly clampedPosition = signal<{ left: number; top: number } | null>(null)
    readonly wasPathCopied = signal(false)

    readonly menuNode = computed(() => (this.rightClickedNodeData() ? (this.codeMapNode() ?? null) : null))
    readonly isFolder = computed(() => (this.menuNode()?.children?.length ?? 0) > 0)
    readonly isShowInExplorerVisible = computed(() => this.rightClickedNodeData()?.origin === "codeMap")
    readonly displayPath = computed(() => {
        const node = this.menuNode()
        if (!node) {
            return ""
        }
        return node.path.lastIndexOf("/") === 0 ? node.name : `…/${node.name}`
    })
    readonly isNodeFocused = computed(() => this.currentFocusedNodePath() === this.menuNode()?.path)
    readonly isParentFocused = computed(() => {
        const focusedPath = this.currentFocusedNodePath()
        const node = this.menuNode()
        return Boolean(focusedPath && node && node.path !== focusedPath && node.path.startsWith(`${focusedPath}/`))
    })
    readonly isHighlighted = computed(() => {
        const node = this.menuNode()
        if (!node) {
            return false
        }
        const building = this.idToBuildingService.get(node.id)
        return building !== undefined && this.threeSceneService.getConstantHighlight().has(building.id)
    })

    constructor() {
        effect(() => {
            const rightClickedNodeData = this.rightClickedNodeData()
            this.clampedPosition.set(null)
            this.wasPathCopied.set(false)
            // a pending measurement from a previous open would clamp the new menu to stale coordinates
            if (this.clampAnimationFrameId !== null) {
                cancelAnimationFrame(this.clampAnimationFrameId)
                this.clampAnimationFrameId = null
            }
            if (rightClickedNodeData && this.menuNode()) {
                this.clampAnimationFrameId = requestAnimationFrame(() => {
                    this.clampAnimationFrameId = null
                    this.clampToViewport(rightClickedNodeData.xPositionOfRightClickEvent, rightClickedNodeData.yPositionOfRightClickEvent)
                })
            }
        })
    }

    @HostListener("document:pointerdown", ["$event"])
    onDocumentPointerDown(event: Event) {
        this.closeWhenOutsideMenu(event)
    }

    @HostListener("document:wheel", ["$event"])
    onDocumentWheel(event: Event) {
        this.closeWhenOutsideMenu(event)
    }

    @HostListener("window:resize")
    onWindowResize() {
        if (this.menuNode()) {
            this.close()
        }
    }

    async copyPath() {
        const node = this.menuNode()
        if (!node) {
            return
        }
        await navigator.clipboard.writeText(this.pathWithoutRootSegment(node))
        this.wasPathCopied.set(true)
        if (this.pathCopiedTimeout) {
            clearTimeout(this.pathCopiedTimeout)
        }
        this.pathCopiedTimeout = setTimeout(() => this.wasPathCopied.set(false), PATH_COPIED_FEEDBACK_DURATION_MS)
    }

    showInExplorer() {
        const node = this.menuNode()
        if (node) {
            this.explorerRevealService.revealNode(node.path)
        }
        this.close()
    }

    focusNode() {
        const node = this.menuNode()
        if (node) {
            this.focusedNodeStore.focus(node.path)
        }
        this.close()
    }

    unfocusNode() {
        this.focusedNodeStore.unfocus()
        this.close()
    }

    unfocusAllNodes() {
        this.focusedNodeStore.unfocusAll()
        this.close()
    }

    keepHighlight() {
        const node = this.menuNode()
        if (node) {
            this.threeSceneService.addNodeAndChildrenToConstantHighlight(node)
        }
        this.close()
    }

    removeHighlight() {
        const node = this.menuNode()
        if (node) {
            this.threeSceneService.removeNodeAndChildrenFromConstantHighlight(node)
        }
        this.close()
    }

    flattenNode() {
        const node = this.menuNode()
        if (node) {
            this.blacklistStore.flattenNode(node)
        }
        this.close()
    }

    unflattenNode() {
        const node = this.menuNode()
        if (node) {
            this.blacklistStore.unflattenNode(node)
        }
        this.close()
    }

    excludeNode() {
        const node = this.menuNode()
        if (node) {
            this.blacklistStore.excludeNode(node)
        }
        this.close()
    }

    close() {
        this.rightClickedNodeStore.clear()
    }

    private closeWhenOutsideMenu(event: Event) {
        const menuElement = this.menuRef()?.nativeElement
        if (!this.menuNode() || !menuElement) {
            return
        }
        if (event.target instanceof Node && menuElement.contains(event.target)) {
            return
        }
        this.close()
    }

    private clampToViewport(x: number, y: number) {
        const menuElement = this.menuRef()?.nativeElement
        if (!menuElement) {
            return
        }
        const { width, height } = menuElement.getBoundingClientRect()
        this.clampedPosition.set({
            left: Math.max(VIEWPORT_MARGIN, Math.min(x, window.innerWidth - width - VIEWPORT_MARGIN)),
            top: Math.max(VIEWPORT_MARGIN, Math.min(y, window.innerHeight - height - VIEWPORT_MARGIN))
        })
    }

    private pathWithoutRootSegment(node: Pick<CodeMapNode, "path" | "name">) {
        const pathBelowRoot = node.path.replace(/^\/root(\/|$)/, "")
        return pathBelowRoot === "" ? node.name : pathBelowRoot
    }
}
