import { ChangeDetectionStrategy, Component, effect, inject, OnDestroy } from "@angular/core"
import { ExplorerCollapseService } from "../../services/explorerCollapse.service"
import { EXPLORER_COLLAPSED_WIDTH, ExplorerWidthService } from "../../services/explorerWidth.service"
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
        class: "fixed left-0 z-[60] bg-base-100 overflow-hidden flex flex-col shadow-[2px_0_8px_-2px_rgba(0,0,0,0.15)]",
        "[class.rounded-br-md]": "isCollapsed()",
        "[style.width.px]": "isCollapsed() ? collapsedWidth : width()",
        "[style.top]": "'var(--cc-bars-height, 49px)'",
        "[style.height]":
            "isCollapsed() ? 'auto' : 'calc(100vh - var(--cc-bars-height, 49px) - var(--cc-file-extension-bar-height, 17px) - var(--cc-bottom-bar-height, 32px))'"
    }
})
export class SidebarExplorerComponent implements OnDestroy {
    private readonly collapseService = inject(ExplorerCollapseService)
    private readonly widthService = inject(ExplorerWidthService)

    readonly isCollapsed = this.collapseService.isCollapsed
    readonly width = this.widthService.width
    readonly collapsedWidth = EXPLORER_COLLAPSED_WIDTH

    // Publish the width the expanded explorer occupies so bottom-centered overlays (e.g. the metrics bar)
    // can offset and avoid being covered by it. Collapsed it is a short top widget, so it occupies nothing here.
    private readonly publishOccupiedWidth = effect(() => {
        const occupiedWidth = this.isCollapsed() ? 0 : this.width()
        document.documentElement.style.setProperty("--cc-explorer-width", `${occupiedWidth}px`)
    })

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
        document.documentElement.style.removeProperty("--cc-explorer-width")
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
