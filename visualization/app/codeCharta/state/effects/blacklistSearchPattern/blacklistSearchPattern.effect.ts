import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { map, filter, withLatestFrom, tap, take, share } from "rxjs"
import { BlacklistType, CcState } from "../../../codeCharta.model"
import { AddBlacklistItemsIfNotResultsInEmptyMapEffect } from "../addBlacklistItemsIfNotResultsInEmptyMap/addBlacklistItemsIfNotResultsInEmptyMap.effect"
import { setSearchPattern } from "../../store/dynamicSettings/searchPattern/searchPattern.actions"
import { searchPatternSelector } from "../../store/dynamicSettings/searchPattern/searchPattern.selector"
import { addBlacklistItems, addBlacklistItemsIfNotResultsInEmptyMap } from "../../store/fileSettings/blacklist/blacklist.actions"
import { parseBlacklistItems } from "../../../ui/ribbonBar/searchPanel/searchBar/utils/parseBlacklistItems"

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
        private readonly addBlacklistItemsIfNotResultsInEmptyMapEffect: AddBlacklistItemsIfNotResultsInEmptyMapEffect
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
                this.addBlacklistItemsIfNotResultsInEmptyMapEffect.doBlacklistItemsResultInEmptyMap$
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
