import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { filter, map, share, take, tap, withLatestFrom } from "rxjs"
import { BlacklistExclusionGuard } from "../../../../features/shared/facade"
import { BlacklistType, CcState } from "../../../../model/codeCharta.model"
import { searchPatternSelector } from "../../../../stores/sharedView/sharedView.read.facade"
import {
    addBlacklistItems,
    addBlacklistItemsIfNotResultsInEmptyMap,
    setSearchPattern
} from "../../../../stores/sharedView/sharedView.write.facade"
import { parseBlacklistItems } from "../../../../util/blacklist/parseBlacklistItems"

type BlacklistSearchPatternAction = {
    type: "BlacklistSearchPatternAction"
    action: { type: BlacklistType }
}

export const blacklistSearchPattern = (type: BlacklistType): BlacklistSearchPatternAction => ({
    type: "BlacklistSearchPatternAction",
    action: { type }
})

@Injectable()
export class BlacklistSearchPatternEffect {
    constructor(
        private readonly actions$: Actions,
        private readonly store: Store<CcState>,
        private readonly blacklistExclusionGuard: BlacklistExclusionGuard
    ) {}

    private readonly searchPattern2BlacklistItems$ = this.actions$.pipe(
        ofType<BlacklistSearchPatternAction>("BlacklistSearchPatternAction"),
        withLatestFrom(this.store.select(searchPatternSelector)),
        map(([blacklistSearchPatternAction, searchPattern]) => ({
            type: blacklistSearchPatternAction.action.type,
            blacklistItems: parseBlacklistItems(blacklistSearchPatternAction.action.type, searchPattern)
        })),
        share()
    )

    flattenSearchPattern$ = createEffect(
        () =>
            this.searchPattern2BlacklistItems$.pipe(
                filter(searchPattern2BlacklistItems => searchPattern2BlacklistItems.type === "flatten"),
                tap(searchPattern2BlacklistItems => {
                    this.store.dispatch(addBlacklistItems({ items: searchPattern2BlacklistItems.blacklistItems }))
                    this.store.dispatch(setSearchPattern({ value: "" }))
                })
            ),
        { dispatch: false }
    )

    excludeSearchPattern$ = createEffect(() =>
        this.searchPattern2BlacklistItems$.pipe(
            filter(searchPattern2BlacklistItems => searchPattern2BlacklistItems.type === "exclude"),
            tap(() => {
                this.blacklistExclusionGuard.doBlacklistItemsResultInEmptyMap$
                    .pipe(
                        take(1),
                        filter(doBlacklistItemsResultInEmptyMap => !doBlacklistItemsResultInEmptyMap.resultsInEmptyMap),
                        tap(() => {
                            this.store.dispatch(setSearchPattern({ value: "" }))
                        })
                    )
                    .subscribe()
            }),
            map(searchPattern2BlacklistItems =>
                addBlacklistItemsIfNotResultsInEmptyMap({ items: searchPattern2BlacklistItems.blacklistItems })
            )
        )
    )
}
