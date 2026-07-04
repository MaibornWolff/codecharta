import { Injectable } from "@angular/core"
import { createEffect } from "@ngrx/effects"
import { filter, map, tap } from "rxjs"
import { addBlacklistItems } from "../../../../sharedView/sharedView.write.facade"
import { ErrorDialogService } from "../../../../util/errorDialog/errorDialog.service"
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
