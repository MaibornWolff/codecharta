import { Injectable } from "@angular/core"
import { createEffect } from "@ngrx/effects"
import { filter, map, tap } from "rxjs"
import { addExcludedNodes } from "../../../../stores/sharedView/sharedView.write.facade"
import { clearPendingHeavyDispatch } from "../../../../util/dispatchAfterPaint"
import { ErrorDialogService } from "../../../../util/errorDialog/errorDialog.service"
import { ExcludeGuard } from "./excludeGuard"

@Injectable()
export class AddExcludedNodesIfNotResultsInEmptyMapEffect {
    constructor(
        private readonly guard: ExcludeGuard,
        private readonly errorDialogService: ErrorDialogService
    ) {}

    showErrorDialogIfExcludedNodesResultInEmptyMap$ = createEffect(
        () =>
            this.guard.doExcludedNodesResultInEmptyMap$.pipe(
                filter(event => event.resultsInEmptyMap),
                tap(() => {
                    // The exclude was routed through dispatchAfterPaint, which showed the full-screen
                    // spinner before dispatching this guarded action. Because the guard rejects, no state
                    // change and no re-render follow, so renderCodeMap$ never clears the spinner. Clear it
                    // here so it disappears as the error dialog appears instead of soft-locking the app.
                    clearPendingHeavyDispatch()
                    this.errorDialogService.open({
                        title: "Exclude Error",
                        message: "Excluding all buildings is not possible."
                    })
                })
            ),
        { dispatch: false }
    )

    addExcludedNodes$ = createEffect(() =>
        this.guard.doExcludedNodesResultInEmptyMap$.pipe(
            filter(event => !event.resultsInEmptyMap),
            map(event => addExcludedNodes({ items: event.items }))
        )
    )
}
