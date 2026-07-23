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

@Component({
    selector: "cc-explorer-tree-level",
    templateUrl: "./explorerTreeLevel.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass, ExplorerTreeItemIconComponent, ExplorerTreeItemNameComponent]
})
export class ExplorerTreeLevelComponent implements OnInit {
    private readonly row = inject(EXPLORER_ROW)
    private readonly selection = inject(EXPLORER_SELECTION)
    // Optional: a view with no context menu (the domain word cloud) provides none, and the right-click is
    // left untouched — no handler, no marker, no scroll listener.
    private readonly contextMenu = inject(EXPLORER_CONTEXT_MENU, { optional: true })
    private readonly revealService = inject(ExplorerRevealService)
    private readonly destroyRef = inject(DestroyRef)

    private isScrollListenerRegistered = false

    readonly node = input.required<CodeMapNode>()
    readonly depth = input.required<number>()

    readonly isOpen = signal(false)

    // Everything view-specific comes from the injected ports, so this component stays free of map/domain concepts.
    readonly rowProjection = computed(() => this.row.project(this.node()))
    readonly isSelectable = computed(() => this.rowProjection().isSelectable)
    readonly isHovered = computed(() => this.selection.isHovered(this.node()))
    readonly isSelected = computed(() => this.selection.isSelected(this.node()))
    readonly isMarked = computed(() => this.contextMenu?.isMarked(this.node()) ?? false)
    readonly hasContextMenu = computed(() => this.contextMenu?.isEnabledFor(this.node()) ?? false)
    readonly isRevealed = computed(() => this.revealService.revealedNodePath() === this.node().path)
    readonly isLeafNode = computed(() => isLeaf(this.node()))
    readonly children = computed(() => this.node().children ?? [])

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
        // Collapsing a parent. The selection port owns whether that clears the selection: the metrics map
        // deselects so the 3D highlight follows the open folder, while the domain word cloud keeps its scope
        // so a tidy-the-tree gesture never resets the cloud. Omitting the flag keeps the metrics behavior.
        if (this.selection.clearsSelectionOnCollapse ?? true) {
            this.selection.deselect()
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

        this.contextMenu?.open(this.node(), $event.clientX, $event.clientY)

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
        this.contextMenu?.close()
        this.removeScrollListener()
    }
}
