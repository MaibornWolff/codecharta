import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { filter, map, share, tap, withLatestFrom } from "rxjs"
import { addBlacklistItems, addBlacklistItemsIfNotResultsInEmptyMap } from "../../store/fileSettings/blacklist/blacklist.actions"
import { visibleFileStatesSelector } from "../../selectors/visibleFileStates/visibleFileStates.selector"
import { blacklistSelector } from "../../store/fileSettings/blacklist/blacklist.selector"
import { resultsInEmptyMap } from "./resultsInEmptyMap"
import { ErrorDialogService } from "../../../ui/dialogs/errorDialog/errorDialog.service"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { createBlacklistMatcher } from "../../../util/blacklist/blacklistMatcher"

@Injectable()
export class AddBlacklistItemsIfNotResultsInEmptyMapEffect {
    constructor(
        private readonly actions$: Actions,
        private readonly store: Store<CcState>,
        private readonly errorDialogService: ErrorDialogService
    ) {}

    doBlacklistItemsResultInEmptyMap$ = this.actions$.pipe(
        ofType(addBlacklistItemsIfNotResultsInEmptyMap),
        withLatestFrom(this.store.select(visibleFileStatesSelector), this.store.select(blacklistSelector)),
        map(([action, visibleFiles, blacklist]) => ({
            items: action.items,
            resultsInEmptyMap: resultsInEmptyMap(visibleFiles, createBlacklistMatcher([...blacklist, ...action.items]))
        })),
        share()
    )

    showErrorDialogIfBlacklistItemsResultInEmptyMap$ = createEffect(
        () =>
            this.doBlacklistItemsResultInEmptyMap$.pipe(
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
        this.doBlacklistItemsResultInEmptyMap$.pipe(
            filter(event => !event.resultsInEmptyMap),
            map(event => addBlacklistItems({ items: event.items }))
        )
    )
}
