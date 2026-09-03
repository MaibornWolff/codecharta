import { Directive, inject } from "@angular/core"
import { ExplorerModeService, ExplorerRevealService, FILES_EXPLORER_MODE } from "../../../features/sidebarExplorer/facade"
import { showHandedOverNodeOnArrival } from "../../../routing/showHandedOverNodeOnArrival"
import { DomainSelectionStore } from "../stores/domainSelection.store"

@Directive({
    selector: "[ccShowsHandedOverNode]"
})
export class ShowsHandedOverNodeDirective {
    private readonly domainSelectionStore = inject(DomainSelectionStore)
    private readonly revealService = inject(ExplorerRevealService)
    private readonly modeService = inject(ExplorerModeService)

    constructor() {
        showHandedOverNodeOnArrival("domain", nodePath => this.showNode(nodePath))
    }

    /** What was handed over is a node, so the explorer has to be browsing nodes to show it. */
    private showNode(nodePath: string): void {
        this.modeService.activate(FILES_EXPLORER_MODE.id)
        this.domainSelectionStore.select(nodePath)
        this.revealService.revealNode(nodePath)
    }
}
