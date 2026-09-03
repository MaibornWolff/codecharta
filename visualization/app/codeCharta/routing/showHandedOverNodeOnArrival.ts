import { inject } from "@angular/core"
import { takeUntilDestroyed } from "@angular/core/rxjs-interop"
import { filter } from "rxjs"
import { ActiveViewStore } from "./activeView.store"
import { ViewId } from "./routePaths"
import { ViewHandoffStore } from "./viewHandoff.store"

/** Runs `showNode` in an injection context whenever the user arrives at `view` on a jump. */
export function showHandedOverNodeOnArrival(view: ViewId, showNode: (nodePath: string) => void): void {
    const viewHandoffStore = inject(ViewHandoffStore)

    inject(ActiveViewStore)
        .activeView$.pipe(
            filter(activeView => activeView === view),
            takeUntilDestroyed()
        )
        .subscribe(() => {
            const nodePath = viewHandoffStore.takeNodeFor(view)
            if (nodePath !== null) {
                showNode(nodePath)
            }
        })
}
