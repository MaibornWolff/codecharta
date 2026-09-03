import { ChangeDetectionStrategy, Component, computed, effect, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { CodeMapNode } from "../../../../model/codeCharta.model"
import { IdToBuildingService, ThreeSceneService } from "../../../../renderer/threeViewer/threeViewer.facade"
import { SharedViewReadWindow } from "../../../../stores/sharedView/sharedView.read.facade"
import { CopyToClipboardService } from "../../../../util/copyToClipboard.service"
import { ContextMenuItemComponent, FloatingMenuComponent } from "../../../shared/facade"
import { ExplorerRevealService } from "../../../sidebarExplorer/facade"
import { NODE_CONTEXT_MENU_CAPABILITIES } from "../../nodeContextMenuCapabilities"
import { NodeContextMenuReadStore } from "../../stores/nodeContextMenu.read.store"
import { NodeContextMenuWriteStore } from "../../stores/nodeContextMenu.write.store"
import { MarkFolderRowComponent } from "./markFolderRow.component"

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
    private readonly threeSceneService = inject(ThreeSceneService)
    private readonly idToBuildingService = inject(IdToBuildingService)
    private readonly explorerRevealService = inject(ExplorerRevealService)
    private readonly clipboard = inject(CopyToClipboardService)

    readonly showMapActions = inject(NODE_CONTEXT_MENU_CAPABILITIES).showMapActions

    readonly rightClickedNodeData = toSignal(this.sharedViewReadWindow.rightClickedNodeData$, { requireSync: true })
    readonly codeMapNode = toSignal(this.readStore.rightClickedCodeMapNode$, { requireSync: true })
    readonly currentFocusedNodePath = toSignal(this.sharedViewReadWindow.currentFocusedNodePath$, { requireSync: true })
    private readonly focusedNodePath = toSignal(this.sharedViewReadWindow.focusedNodePath$, { requireSync: true })
    readonly hasPreviousFocusedNodePath = computed(() => this.focusedNodePath().length > 1)

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

    unfocusAllNodes() {
        this.writeStore.unfocusAll()
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

    private pathWithoutRootSegment(node: Pick<CodeMapNode, "path" | "name">) {
        const pathBelowRoot = node.path.replace(/^\/root(\/|$)/, "")
        return pathBelowRoot === "" ? node.name : pathBelowRoot
    }
}
