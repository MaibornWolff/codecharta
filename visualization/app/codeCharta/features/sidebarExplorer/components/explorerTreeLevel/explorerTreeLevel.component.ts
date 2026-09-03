import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, input, OnInit, signal } from "@angular/core"
import { CodeMapNode } from "../../../../model/codeCharta.model"
import { isLeaf } from "../../../../util/codeMapHelper"
import { EXPLORER_CONTEXT_MENU } from "../../explorerContextMenu"
import { EXPLORER_ROW } from "../../explorerRow"
import { explorerRowId } from "../../explorerRowId"
import { EXPLORER_SELECTION } from "../../explorerSelection"
import { EXPLORER_STORAGE_SCOPE } from "../../explorerStorageScope"
import { scrollRowIntoViewWhenRendered } from "../../scrollRowIntoView"
import { ExplorerRevealService } from "../../services/explorerReveal.service"
import { ExplorerScrollHostService } from "../../services/explorerScrollHost.service"
import { ExplorerRowComponent } from "../explorerRow/explorerRow.component"
import { ExplorerTreeItemIconComponent } from "../explorerTreeItemIcon/explorerTreeItemIcon.component"
import { ExplorerTreeItemNameComponent } from "../explorerTreeItemName/explorerTreeItemName.component"

@Component({
    selector: "cc-explorer-tree-level",
    templateUrl: "./explorerTreeLevel.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ExplorerRowComponent, ExplorerTreeItemIconComponent, ExplorerTreeItemNameComponent]
})
export class ExplorerTreeLevelComponent implements OnInit {
    private readonly row = inject(EXPLORER_ROW)
    private readonly selection = inject(EXPLORER_SELECTION)
    private readonly contextMenu = inject(EXPLORER_CONTEXT_MENU, { optional: true })
    private readonly revealService = inject(ExplorerRevealService)
    private readonly scrollHostService = inject(ExplorerScrollHostService)
    private readonly storageScope = inject(EXPLORER_STORAGE_SCOPE)
    private readonly destroyRef = inject(DestroyRef)

    private scrollHostWithListener: HTMLElement | null = null

    readonly node = input.required<CodeMapNode>()
    readonly depth = input.required<number>()

    readonly isOpen = signal(false)

    readonly rowId = computed(() => explorerRowId(this.storageScope, this.node().path))
    readonly rowProjection = computed(() => this.row.project(this.node()))
    readonly isSelectable = computed(() => this.rowProjection().isSelectable)
    readonly isHovered = computed(() => this.selection.isHovered(this.node()))
    readonly isSelected = computed(() => this.selection.isSelected(this.node()))
    readonly isMarked = computed(() => this.contextMenu?.isMarked(this.node()) ?? false)
    readonly hasContextMenu = computed(() => this.contextMenu?.isEnabledFor(this.node()) ?? false)
    readonly isRevealed = computed(() => this.revealService.revealedNodePath() === this.node().path)
    readonly isLeafNode = computed(() => isLeaf(this.node()))
    readonly children = computed(() => this.node().children ?? [])

    private readonly revealEffect = effect(() => this.openForRevealedDescendantAndScrollToRevealedSelf())

    private openForRevealedDescendantAndScrollToRevealedSelf() {
        const revealedNodePath = this.revealService.revealedNodePath()
        if (!revealedNodePath) {
            return
        }
        const path = this.node().path
        if (revealedNodePath.startsWith(`${path}/`)) {
            this.isOpen.set(true)
        }
        if (revealedNodePath === path) {
            scrollRowIntoViewWhenRendered(this.rowId(), () => this.revealService.revealedNodePath() === path)
        }
    }

    ngOnInit(): void {
        this.isOpen.set(this.depth() === 0)
        this.destroyRef.onDestroy(() => this.removeScrollListener())
    }

    onMouseEnter($event: MouseEvent) {
        const rowRect = ($event.currentTarget as HTMLElement).getBoundingClientRect()
        this.selection.hover(this.node(), rowRect)
    }

    onMouseLeave() {
        this.selection.hoverEnd()
    }

    onClick() {
        if (!this.isSelectable()) {
            return
        }
        const willBeOpen = !this.isOpen()
        this.isOpen.set(willBeOpen)
        if (this.isLeafNode() || willBeOpen) {
            this.selection.select(this.node())
            return
        }
        const collapsingClearsSelection = this.selection.clearsSelectionOnCollapse ?? true
        if (collapsingClearsSelection) {
            this.selection.deselect()
        }
    }

    openNodeContextMenu = ($event: MouseEvent) => {
        if (!this.hasContextMenu()) {
            return
        }

        $event.preventDefault()
        $event.stopPropagation()

        this.contextMenu?.open(this.node(), $event.clientX, $event.clientY)

        this.addScrollListener()
    }

    private addScrollListener() {
        if (this.scrollHostWithListener) {
            return
        }
        const scrollHost = this.scrollHostService.element()
        scrollHost?.addEventListener("scroll", this.closeContextMenuOnScroll)
        this.scrollHostWithListener = scrollHost
    }

    private removeScrollListener() {
        this.scrollHostWithListener?.removeEventListener("scroll", this.closeContextMenuOnScroll)
        this.scrollHostWithListener = null
    }

    private readonly closeContextMenuOnScroll = () => {
        this.contextMenu?.close()
        this.removeScrollListener()
    }
}
