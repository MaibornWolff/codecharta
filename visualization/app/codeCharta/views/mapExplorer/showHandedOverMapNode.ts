import { inject } from "@angular/core"
import { Store } from "@ngrx/store"
import { take } from "rxjs"
import { EXPLORER_SELECTION, ExplorerRevealService } from "../../features/sidebarExplorer/facade"
import { createNodeByPathSelector } from "../../renderer/renderModel/renderModel.facade"
import { ViewId } from "../../routing/routePaths"
import { showHandedOverNodeOnArrival } from "../../routing/showHandedOverNodeOnArrival"

/** Selects the map node another view handed over and reveals it in the explorer; must run in an injection context. */
export function showHandedOverMapNode(view: ViewId): void {
    const store = inject(Store)
    const selection = inject(EXPLORER_SELECTION)
    const revealService = inject(ExplorerRevealService)

    showHandedOverNodeOnArrival(view, nodePath =>
        store
            .select(createNodeByPathSelector(nodePath))
            .pipe(take(1))
            .subscribe(node => {
                if (!node) {
                    return
                }
                selection.select(node)
                revealService.revealNode(nodePath)
            })
    )
}
