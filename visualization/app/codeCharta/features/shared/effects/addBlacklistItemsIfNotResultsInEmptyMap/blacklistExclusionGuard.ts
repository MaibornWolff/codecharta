import { Injectable } from "@angular/core"
import { Actions, ofType } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { map, share, withLatestFrom } from "rxjs"
import { CcState } from "../../../../model/codeCharta.model"
import { visibleFileStatesSelector } from "../../../../stores/fileStore/fileStore.facade"
import { blacklistSelector } from "../../../../stores/sharedView/sharedView.read.facade"
import { addBlacklistItemsIfNotResultsInEmptyMap } from "../../../../stores/sharedView/sharedView.write.facade"
import { createBlacklistMatcher } from "../../../../util/blacklist/blacklistMatcher"
import { resultsInEmptyMap } from "../../../../util/blacklist/resultsInEmptyMap"

@Injectable({ providedIn: "root" })
export class BlacklistExclusionGuard {
    constructor(
        private readonly actions$: Actions,
        private readonly store: Store<CcState>
    ) {}

    readonly doBlacklistItemsResultInEmptyMap$ = this.actions$.pipe(
        ofType(addBlacklistItemsIfNotResultsInEmptyMap),
        withLatestFrom(this.store.select(visibleFileStatesSelector), this.store.select(blacklistSelector)),
        map(([action, visibleFiles, blacklist]) => ({
            items: action.items,
            resultsInEmptyMap: resultsInEmptyMap(visibleFiles, createBlacklistMatcher([...blacklist, ...action.items]))
        })),
        share()
    )
}
