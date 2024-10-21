import { Injectable } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { filter, map, share, tap, withLatestFrom } from "rxjs"
import { addBlacklistItems, addBlacklistItemsIfNotResultsInEmptyMap } from "../../store/fileSettings/blacklist/blacklist.actions"
import { visibleFileStatesSelector } from "../../selectors/visibleFileStates/visibleFileStates.selector"
import { blacklistSelector } from "../../store/fileSettings/blacklist/blacklist.selector"
import { resultsInEmptyMap } from "./resultsInEmptyMap"
import { ErrorDialogComponent } from "../../../ui/dialogs/errorDialog/errorDialog.component"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"

@Injectable()
export class AddBlacklistItemsIfNotResultsInEmptyMapEffect {
    constructor(
        private actions$: Actions,
        private store: Store<CcState>,
        private dialog: MatDialog
    ) {}

    doBlacklistItemsResultInEmptyMap$ = this.actions$.pipe(
        ofType(addBlacklistItemsIfNotResultsInEmptyMap),
        withLatestFrom(this.store.select(visibleFileStatesSelector), this.store.select(blacklistSelector)),
        map(([action, visibleFiles, blacklist]) => ({
            items: action.items,
            resultsInEmptyMap: resultsInEmptyMap(visibleFiles, blacklist, action.items)
        })),
        share()
    )

    showErrorDialogIfBlacklistItemsResultInEmptyMap$ = createEffect(
        () =>
            this.doBlacklistItemsResultInEmptyMap$.pipe(
                filter(event => event.resultsInEmptyMap),
                tap(() => {
                    this.dialog.open(ErrorDialogComponent, {
                        data: { title: "Blacklist Error", message: "Excluding all buildings is not possible." }
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
