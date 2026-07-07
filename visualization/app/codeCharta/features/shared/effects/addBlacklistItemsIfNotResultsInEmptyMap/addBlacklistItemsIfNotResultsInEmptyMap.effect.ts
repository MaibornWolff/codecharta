import { Injectable } from "@angular/core"
import { createEffect } from "@ngrx/effects"
import { filter, map, tap } from "rxjs"
import { addBlacklistItems } from "../../../../stores/sharedView/sharedView.write.facade"
import { ErrorDialogService } from "../../../../util/errorDialog/errorDialog.service"
import { clearPendingHeavyDispatch } from "../../../../util/dispatchAfterPaint"
import { BlacklistExclusionGuard } from "./blacklistExclusionGuard"

@Injectable()
export class AddBlacklistItemsIfNotResultsInEmptyMapEffect {
    constructor(
        private readonly guard: BlacklistExclusionGuard,
        private readonly errorDialogService: ErrorDialogService
    ) {}

    showErrorDialogIfBlacklistItemsResultInEmptyMap$ = createEffect(
        () =>
            this.guard.doBlacklistItemsResultInEmptyMap$.pipe(
                filter(event => event.resultsInEmptyMap),
                tap(() => {
                    // The exclude was routed through dispatchAfterPaint, which showed the full-screen
                    // spinner before dispatching this guarded action. Because the guard rejects, no state
                    // change and no re-render follow, so renderCodeMap$ never clears the spinner. Clear it
                    // here so it disappears as the error dialog appears instead of soft-locking the app.
                    clearPendingHeavyDispatch()
                    this.errorDialogService.open({
                        title: "Blacklist Error",
                        message: "Excluding all buildings is not possible."
                    })
                })
            ),
        { dispatch: false }
    )

    addBlacklistItems$ = createEffect(() =>
        this.guard.doBlacklistItemsResultInEmptyMap$.pipe(
            filter(event => !event.resultsInEmptyMap),
            map(event => addBlacklistItems({ items: event.items }))
        )
    )
}
