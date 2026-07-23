import { Injectable, inject } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { tap } from "rxjs"
import { filesLoaded } from "../../../../stores/fileStore/fileStore.facade"
import { DomainSelectionStore } from "../../stores/domainSelection.store"

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
