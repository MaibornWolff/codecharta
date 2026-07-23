import { NgClass } from "@angular/common"
import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, input, OnInit, signal } from "@angular/core"
import { CodeMapNode } from "../../../../model/codeCharta.model"
import { isLeaf } from "../../../../util/codeMapHelper"
import { EXPLORER_CONTEXT_MENU } from "../../explorerContextMenu"
import { EXPLORER_ROW } from "../../explorerRow"
import { EXPLORER_SELECTION } from "../../explorerSelection"
import { scrollRowIntoViewWhenRendered } from "../../scrollRowIntoView"
import { ExplorerRevealService } from "../../services/explorerReveal.service"
import { ExplorerTreeItemIconComponent } from "../explorerTreeItemIcon/explorerTreeItemIcon.component"
import { ExplorerTreeItemNameComponent } from "../explorerTreeItemName/explorerTreeItemName.component"

const EXPLORER_SCROLL_HOST_SELECTOR = "#explorer-scroll"

@Component({
    selector: "cc-explorer-tree-level",
    templateUrl: "./explorerTreeLevel.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass, ExplorerTreeItemIconComponent, ExplorerTreeItemNameComponent]
})
export class ExplorerTreeLevelComponent implements OnInit {
    private readonly row = inject(EXPLORER_ROW)
    private readonly selection = inject(EXPLORER_SELECTION)
    private readonly contextMenu = inject(EXPLORER_CONTEXT_MENU, { optional: true })
    private readonly revealService = inject(ExplorerRevealService)
    private readonly destroyRef = inject(DestroyRef)

    private isScrollListenerRegistered = false

    readonly node = input.required<CodeMapNode>()
    readonly depth = input.required<number>()

    readonly isOpen = signal(false)

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
            scrollRowIntoViewWhenRendered(path, () => this.revealService.revealedNodePath() === path)
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
        if (this.isScrollListenerRegistered) {
            return
        }
        this.scrollHost()?.addEventListener("scroll", this.closeContextMenuOnScroll)
        this.isScrollListenerRegistered = true
    }

    private removeScrollListener() {
        if (!this.isScrollListenerRegistered) {
            return
        }
        this.scrollHost()?.removeEventListener("scroll", this.closeContextMenuOnScroll)
        this.isScrollListenerRegistered = false
    }

    private scrollHost(): Element | null {
        return document.querySelector(EXPLORER_SCROLL_HOST_SELECTOR)
    }

    private readonly closeContextMenuOnScroll = () => {
        this.contextMenu?.close()
        this.removeScrollListener()
    }
}
