import { Injectable, inject } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { tap } from "rxjs"
import { filesLoaded } from "../../../../stores/fileStore/fileStore.facade"
import { DomainSelectionStore } from "../../stores/domainSelection.store"

/**
 * Clears the domain view's ephemeral selection whenever a file set loads.
 *
 * The domain selection is a bare node path held outside the persisted state. Unlike the metrics view —
 * whose 3D-scene rebuild remaps or drops a selected building on load — nothing else touches this store, so
 * a path selected against the previous file set would otherwise outlive it: the word cloud would ask for
 * `words[stalePath]`, get nothing and strand on its empty state while the bottom bar quietly fell back to
 * the new root. Resetting to the root (null) on every load keeps both in agreement and matches "a load is a
 * fresh start".
 */
@Injectable()
export class ResetDomainSelectionAfterLoadEffect {
    private readonly actions$ = inject(Actions)
    private readonly domainSelectionStore = inject(DomainSelectionStore)

    resetDomainSelectionAfterLoad$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(filesLoaded),
                tap(() => this.domainSelectionStore.clear())
            ),
        { dispatch: false }
    )
}
