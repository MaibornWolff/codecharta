import { ChangeDetectionStrategy, Component, computed, effect, inject, OnDestroy } from "@angular/core"
import { EXPLORER_CAPABILITIES } from "../../explorerCapabilities"
import { ExplorerCollapseService } from "../../services/explorerCollapse.service"
import { EXPLORER_WIDTH_CSS_VARIABLE, ExplorerWidthService } from "../../services/explorerWidth.service"
import { ExplorerFindBarComponent } from "../explorerFindBar/explorerFindBar.component"
import { ExplorerHeaderComponent } from "../explorerHeader/explorerHeader.component"
import { ExplorerSearchBarComponent } from "../explorerSearchBar/explorerSearchBar.component"
import { ExplorerSortControlComponent } from "../explorerSortControl/explorerSortControl.component"
import { ExplorerTreeComponent } from "../explorerTree/explorerTree.component"
import { RulesPopoverComponent } from "../rulesPopover/rulesPopover.component"

/**
 * The collapsed strip's FIXED width — deliberately independent of the dragged expanded width, so the
 * minimized bar always looks the same no matter how wide the user made the panel. Wide enough for the
 * collapsed content (the metrics search bar, or the domain selected-path + copy).
 */
export const COLLAPSED_WIDTH = 300

@Component({
    selector: "cc-sidebar-explorer",
    templateUrl: "./sidebarExplorer.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ExplorerHeaderComponent,
        ExplorerSearchBarComponent,
        ExplorerFindBarComponent,
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
        // Expanded uses the dragged width; collapsed uses a FIXED width so the minimized bar is stable and
        // no longer changes with how wide the user dragged the panel. The dragged width is kept for re-expand.
        "[style.width.px]": "displayWidth()",
        "[style.top]": "'var(--cc-bars-height, 49px)'",
        // The file-extension bar publishes its height on mount and removes the variable on destroy, so the
        // fallback is the height of an absent bar: 0. Views that do mount it (metrics) get the measured value.
        "[style.height]":
            "isCollapsed() ? 'auto' : 'calc(100vh - var(--cc-bars-height, 49px) - var(--cc-file-extension-bar-height, 0px) - var(--cc-bottom-bar-height, 32px))'"
    }
})
export class SidebarExplorerComponent implements OnDestroy {
    private readonly collapseService = inject(ExplorerCollapseService)
    private readonly widthService = inject(ExplorerWidthService)

    // Which optional chrome to render is the hosting view's call: the metrics view keeps the
    // flatten/exclude rules, the search bar and the counters; the domain word cloud has no use for
    // any of them, because flatten, hide and area counts are all 3D-map concepts.
    readonly capabilities = inject(EXPLORER_CAPABILITIES)

    readonly isCollapsed = this.collapseService.isCollapsed
    readonly width = this.widthService.width
    // Collapsed → a fixed strip width; expanded → the width the user dragged.
    readonly displayWidth = computed(() => (this.isCollapsed() ? COLLAPSED_WIDTH : this.width()))

    constructor() {
        // Publish the horizontal footprint the expanded panel occupies so the floating bottom bars can
        // center in the space to its right instead of hiding their left controls behind the sidebar.
        // Collapsed the explorer is a short top strip that overlaps nothing at the viewport bottom, so it
        // claims 0. Both views share the width/collapse root services, so a kept-alive detached instance
        // publishing the same value is harmless.
        effect(() => {
            const inset = this.isCollapsed() ? 0 : this.width()
            document.documentElement.style.setProperty(EXPLORER_WIDTH_CSS_VARIABLE, `${inset}px`)
        })
    }

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

    ngOnDestroy() {
        this.stopResize()
        // Only fires on genuine teardown (the keep-alive strategy detaches rather than destroys views), so
        // there is no live sibling explorer whose published inset this would clobber.
        document.documentElement.style.removeProperty(EXPLORER_WIDTH_CSS_VARIABLE)
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
