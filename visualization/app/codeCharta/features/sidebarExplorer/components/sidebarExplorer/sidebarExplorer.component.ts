import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnDestroy, signal } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { SharedViewReadWindow } from "../../../../stores/sharedView/sharedView.read.facade"
import { EXPLORER_HOST } from "../../explorerHost"
import { ExplorerCollapseService } from "../../services/explorerCollapse.service"
import { ExplorerWidthService } from "../../services/explorerWidth.service"
import { ExplorerHeaderComponent } from "../explorerHeader/explorerHeader.component"
import { ExplorerSearchBarComponent } from "../explorerSearchBar/explorerSearchBar.component"
import { ExplorerSortControlComponent } from "../explorerSortControl/explorerSortControl.component"
import { ExplorerTreeComponent } from "../explorerTree/explorerTree.component"
import { RulesPopoverComponent } from "../rulesPopover/rulesPopover.component"

@Component({
    selector: "cc-sidebar-explorer",
    templateUrl: "./sidebarExplorer.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ExplorerHeaderComponent,
        ExplorerSearchBarComponent,
        ExplorerSortControlComponent,
        ExplorerTreeComponent,
        RulesPopoverComponent
    ],
    host: {
        class: "fixed left-0 z-[60] bg-base-100 flex flex-col shadow-[2px_0_8px_-2px_rgba(0,0,0,0.15)]",
        // Only the expanded panel clips: it is a full-height scroll container. Collapsed it is a single
        // short row, so clipping there would swallow anything a child renders outside that row.
        "[class.overflow-hidden]": "!isCollapsed()",
        "[class.rounded-br-md]": "isCollapsed()",
        // Collapsed keeps the width the user dragged. A separate collapsed width made the bar change size
        // on every toggle and, being fixed, could not fit the paths it now shows.
        "[style.width.px]": "width()",
        "[style.top]": "'var(--cc-bars-height, 49px)'",
        // The file-extension bar publishes its height on mount and removes the variable on destroy, so the
        // fallback is the height of an absent bar: 0. Views that do mount it (metrics) get the measured value.
        "[style.height]":
            "isCollapsed() ? 'auto' : 'calc(100vh - var(--cc-bars-height, 49px) - var(--cc-file-extension-bar-height, 0px) - var(--cc-bottom-bar-height, 32px))'"
    }
})
export class SidebarExplorerComponent implements OnDestroy {
    private static readonly COPY_FEEDBACK_MS = 1500

    private readonly collapseService = inject(ExplorerCollapseService)
    private readonly widthService = inject(ExplorerWidthService)
    private readonly sharedViewReadWindow = inject(SharedViewReadWindow)
    private readonly host = inject(EXPLORER_HOST)

    private copyFeedbackTimeout?: ReturnType<typeof setTimeout>

    constructor() {
        inject(DestroyRef).onDestroy(() => clearTimeout(this.copyFeedbackTimeout))
    }

    // Which optional chrome to render is the hosting view's call: the metrics view keeps the
    // flatten/exclude rules, the search bar and the counters; the domain word cloud has no use for
    // any of them, because flatten, hide and area counts are all 3D-map concepts.
    readonly capabilities = this.host.capabilities

    readonly isCollapsed = this.collapseService.isCollapsed
    readonly width = this.widthService.width
    readonly copied = signal(false)

    readonly selectedNodePath = toSignal(this.sharedViewReadWindow.selectedBuildingId$, { requireSync: true })
    readonly selectedNodeName = computed(() => this.selectedNodePath()?.split("/").filter(Boolean).at(-1) ?? "")

    private isResizing = false
    private readonly onPointerMove = (event: PointerEvent) => this.resize(event)
    private readonly onPointerUp = () => this.stopResize()

    toggle() {
        this.collapseService.toggle()
    }

    startResize(event: PointerEvent) {
        event.preventDefault()
        this.isResizing = true
        document.body.style.userSelect = "none"
        globalThis.addEventListener("pointermove", this.onPointerMove)
        globalThis.addEventListener("pointerup", this.onPointerUp)
        globalThis.addEventListener("pointercancel", this.onPointerUp)
    }

    resetWidth() {
        this.widthService.reset()
    }

    async copySelectedPath() {
        const path = this.selectedNodePath()
        if (!path) {
            return
        }
        await navigator.clipboard.writeText(path)
        this.copied.set(true)
        clearTimeout(this.copyFeedbackTimeout)
        this.copyFeedbackTimeout = setTimeout(() => this.copied.set(false), SidebarExplorerComponent.COPY_FEEDBACK_MS)
    }

    ngOnDestroy() {
        this.stopResize()
    }

    private resize(event: PointerEvent) {
        if (!this.isResizing) {
            return
        }
        this.widthService.setWidth(event.clientX)
    }

    private stopResize() {
        if (!this.isResizing) {
            return
        }
        this.isResizing = false
        document.body.style.userSelect = ""
        globalThis.removeEventListener("pointermove", this.onPointerMove)
        globalThis.removeEventListener("pointerup", this.onPointerUp)
        globalThis.removeEventListener("pointercancel", this.onPointerUp)
    }
}
