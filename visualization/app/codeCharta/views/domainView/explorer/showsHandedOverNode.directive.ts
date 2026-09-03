import { Directive, inject } from "@angular/core"
import { ExplorerRevealService } from "../../../features/sidebarExplorer/facade"
import { showHandedOverNodeOnArrival } from "../../../routing/showHandedOverNodeOnArrival"
import { DomainSelectionStore } from "../stores/domainSelection.store"

@Directive({
    selector: "[ccShowsHandedOverNode]"
})
export class ShowsHandedOverNodeDirective {
    private readonly domainSelectionStore = inject(DomainSelectionStore)
    private readonly revealService = inject(ExplorerRevealService)

    constructor() {
        showHandedOverNodeOnArrival("domain", nodePath => this.showNode(nodePath))
    }

    private showNode(nodePath: string): void {
        this.domainSelectionStore.select(nodePath)
        this.revealService.revealNode(nodePath)
    }
}
