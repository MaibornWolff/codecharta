import { ChangeDetectionStrategy, Component, computed, effect, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { CodeMapNode } from "../../../../model/codeCharta.model"
import { ActiveViewStore } from "../../../../routing/activeView.store"
import { VIEW_IDS, ViewId } from "../../../../routing/routePaths"
import { SharedViewReadWindow } from "../../../../stores/sharedView/sharedView.read.facade"
import { CopyToClipboardService } from "../../../../util/copyToClipboard.service"
import { ContextMenuItemComponent, FloatingMenuComponent } from "../../../shared/facade"
import { ExplorerRevealService } from "../../../sidebarExplorer/facade"
import { NODE_CONTEXT_MENU_CAPABILITIES } from "../../nodeContextMenuCapabilities"
import { NodeContextMenuReadStore } from "../../stores/nodeContextMenu.read.store"
import { NodeContextMenuWriteStore } from "../../stores/nodeContextMenu.write.store"
import { MarkFolderRowComponent } from "./markFolderRow.component"

const JUMP_TARGETS: Record<ViewId, { label: string; icon: string; hoverHint: string }> = {
    metrics: { label: "Show in Metrics", icon: "fa-solid fa-cubes", hoverHint: "Select this node on the metrics map" },
    domain: { label: "Show in Domain", icon: "fa-solid fa-cloud", hoverHint: "Show the domain words below this node" },
    dependencies: {
        label: "Show in Dependencies",
        icon: "fa-solid fa-diagram-project",
        hoverHint: "Show this node in the dependency graph"
    }
}

@Component({
    selector: "cc-node-context-menu",
    templateUrl: "./nodeContextMenu.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ContextMenuItemComponent, FloatingMenuComponent, MarkFolderRowComponent],
    providers: [CopyToClipboardService]
})
export class NodeContextMenuComponent {
    private readonly sharedViewReadWindow = inject(SharedViewReadWindow)
    private readonly readStore = inject(NodeContextMenuReadStore)
    private readonly writeStore = inject(NodeContextMenuWriteStore)
    private readonly explorerRevealService = inject(ExplorerRevealService)
    private readonly clipboard = inject(CopyToClipboardService)

    private readonly capabilities = inject(NODE_CONTEXT_MENU_CAPABILITIES)
    private readonly activeView = toSignal(inject(ActiveViewStore).activeView$, { requireSync: true })

    private readonly focusableNodes = this.capabilities.focusableNodes
    readonly showMapActions = this.capabilities.showMapActions
    readonly showExclude = this.capabilities.showExclude

    readonly rightClickedNodeData = toSignal(this.sharedViewReadWindow.rightClickedNodeData$, { requireSync: true })
    readonly codeMapNode = toSignal(this.readStore.rightClickedCodeMapNode$, { requireSync: true })
    readonly currentFocusedNodePath = toSignal(this.sharedViewReadWindow.currentFocusedNodePath$, { requireSync: true })

    readonly wasPathCopied = this.clipboard.copied

    readonly openMenu = computed(() => {
        const rightClickedNodeData = this.rightClickedNodeData()
        const node = this.codeMapNode()
        if (!rightClickedNodeData || !node) {
            return null
        }
        return {
            node,
            anchor: { x: rightClickedNodeData.xPositionOfRightClickEvent, y: rightClickedNodeData.yPositionOfRightClickEvent }
        }
    })
    readonly menuNode = computed(() => this.openMenu()?.node ?? null)
    // The map answers flatness while it lays itself out, so the menu asks the same question rather
    // than reading a flag off the node.
    private readonly isFlattened = toSignal(this.readStore.isFlattened$, { requireSync: true })
    readonly isMenuNodeFlattened = computed(() => {
        const node = this.menuNode()
        return node !== null && this.isFlattened()(node)
    })
    private readonly isMenuNodeInDomainLens = toSignal(this.readStore.isRightClickedNodeInDomainLens$, { requireSync: true })
    private readonly isMenuNodeInDependencyLens = toSignal(this.readStore.isRightClickedNodeInDependencyLens$, { requireSync: true })
    readonly jumpTargets = computed(() => {
        const node = this.menuNode()
        return node === null
            ? []
            : VIEW_IDS.filter(view => view !== this.activeView() && this.canShowMenuNodeIn(view)).map(view => ({
                  view,
                  ...JUMP_TARGETS[view]
              }))
    })

    readonly isFolder = computed(() => (this.menuNode()?.children?.length ?? 0) > 0)
    readonly isShowInExplorerVisible = computed(() => this.rightClickedNodeData()?.origin !== "explorer")
    readonly isFocusOffered = computed(() => this.focusableNodes !== "none" && !this.isNodeFocused() && this.isFolder())
    readonly isUnfocusOffered = computed(() => this.focusableNodes !== "none" && (this.isNodeFocused() || this.isParentFocused()))
    readonly hasViewActions = computed(() => this.showMapActions || this.isFocusOffered() || this.isUnfocusOffered())
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
    private readonly keptHighlightPaths = toSignal(this.readStore.keptHighlightPaths$, { requireSync: true })
    readonly isHighlighted = computed(() => {
        const node = this.menuNode()
        return node !== null && this.keptHighlightPaths().includes(node.path)
    })

    constructor() {
        // a menu opened for another node must not still show the previous node's copy confirmation
        effect(() => {
            this.rightClickedNodeData()
            this.clipboard.reset()
        })
    }

    async copyPath() {
        const node = this.menuNode()
        if (node) {
            await this.clipboard.copy(this.pathWithoutRootSegment(node))
        }
    }

    showInView(view: ViewId) {
        const node = this.menuNode()
        if (node) {
            this.writeStore.showNodeInView(view, node.path)
        }
        this.close()
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
            this.writeStore.focus(node.path)
        }
        this.close()
    }

    unfocusNode() {
        this.writeStore.unfocus()
        this.close()
    }

    keepHighlight() {
        const node = this.menuNode()
        if (node) {
            this.writeStore.keepHighlight(node)
        }
        this.close()
    }

    removeHighlight() {
        const node = this.menuNode()
        if (node) {
            this.writeStore.removeHighlight(node)
        }
        this.close()
    }

    flattenNode() {
        const node = this.menuNode()
        if (node) {
            this.writeStore.flattenNode(node)
        }
        this.close()
    }

    unflattenNode() {
        const node = this.menuNode()
        if (node) {
            this.writeStore.unflattenNode(node)
        }
        this.close()
    }

    excludeNode() {
        const node = this.menuNode()
        if (node) {
            this.writeStore.excludeNode(node)
        }
        this.close()
    }

    close() {
        this.writeStore.closeMenu()
    }

    private canShowMenuNodeIn(view: ViewId): boolean {
        switch (view) {
            case "domain":
                return this.isMenuNodeInDomainLens()
            case "dependencies":
                return this.isMenuNodeInDependencyLens()
            default:
                return true
        }
    }

    private pathWithoutRootSegment(node: Pick<CodeMapNode, "path" | "name">) {
        const pathBelowRoot = node.path.replace(/^\/root(\/|$)/, "")
        return pathBelowRoot === "" ? node.name : pathBelowRoot
    }
}
