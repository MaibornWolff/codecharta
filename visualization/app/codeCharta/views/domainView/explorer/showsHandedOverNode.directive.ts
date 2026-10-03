import { Directive, inject } from "@angular/core"
import { SharedFocusStore } from "../../../features/shared/facade"
import { ExplorerModeService, ExplorerRevealService, FILES_EXPLORER_MODE } from "../../../features/sidebarExplorer/facade"
import { showHandedOverNodeOnArrival } from "../../../routing/showHandedOverNodeOnArrival"
import { isInsideFolder } from "../isInsideFolder"
import { DomainSelectionStore } from "../stores/domainSelection.store"

@Directive({
    selector: "[ccShowsHandedOverNode]"
})
export class ShowsHandedOverNodeDirective {
    private readonly domainSelectionStore = inject(DomainSelectionStore)
    private readonly revealService = inject(ExplorerRevealService)
    private readonly modeService = inject(ExplorerModeService)
    private readonly focusStore = inject(SharedFocusStore)

    constructor() {
        showHandedOverNodeOnArrival("domain", nodePath => this.showNode(nodePath))
    }

    /** What was handed over is a node, so the explorer has to be browsing nodes to show it. The explorer
     * lists only what lies in the focus, so a node from outside it clears the focus. */
    private showNode(nodePath: string): void {
        const focusedNodePath = this.focusStore.focusedNodePath()
        if (focusedNodePath && !isInsideFolder(nodePath, focusedNodePath)) {
            this.focusStore.unfocus()
        }
        this.modeService.activate(FILES_EXPLORER_MODE.id)
        this.domainSelectionStore.select(nodePath)
        this.revealService.revealNode(nodePath)
    }
}
