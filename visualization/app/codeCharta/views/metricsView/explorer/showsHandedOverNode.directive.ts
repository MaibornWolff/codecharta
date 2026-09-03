import { Directive, inject } from "@angular/core"
import { Store } from "@ngrx/store"
import { take } from "rxjs"
import { EXPLORER_SELECTION, ExplorerRevealService } from "../../../features/sidebarExplorer/facade"
import { createNodeByPathSelector } from "../../../renderer/renderModel/renderModel.facade"
import { showHandedOverNodeOnArrival } from "../../../routing/showHandedOverNodeOnArrival"

@Directive({
    selector: "[ccShowsHandedOverNode]"
})
export class ShowsHandedOverNodeDirective {
    private readonly store = inject(Store)
    private readonly selection = inject(EXPLORER_SELECTION)
    private readonly revealService = inject(ExplorerRevealService)

    constructor() {
        showHandedOverNodeOnArrival("metrics", nodePath => this.showNode(nodePath))
    }

    private showNode(nodePath: string): void {
        this.store
            .select(createNodeByPathSelector(nodePath))
            .pipe(take(1))
            .subscribe(node => {
                if (!node) {
                    return
                }
                this.selection.select(node)
                this.revealService.revealNode(nodePath)
            })
    }
}
