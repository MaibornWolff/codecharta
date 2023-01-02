import { Inject, Injectable } from "@angular/core"
import { map, filter, withLatestFrom, tap, take } from "rxjs"
import { BlacklistType } from "../../../codeCharta.model"
import { createEffect } from "../../../state/angular-redux/effects/createEffect"
import { Actions, ActionsToken } from "../../../state/angular-redux/effects/effects.module"
import { ofType } from "../../../state/angular-redux/ofType"
import { Store } from "../../../state/angular-redux/store"
import { AddBlacklistItemsIfNotResultsInEmptyMapEffect } from "../../../state/effects/addBlacklistItemsIfNotResultsInEmptyMap/addBlacklistItemsIfNotResultsInEmptyMap.effect"
import { setSearchPattern } from "../../../state/store/dynamicSettings/searchPattern/searchPattern.actions"
import { searchPatternSelector } from "../../../state/store/dynamicSettings/searchPattern/searchPattern.selector"
import { addBlacklistItems, addBlacklistItemsIfNotResultsInEmptyMap } from "../../../state/store/fileSettings/blacklist/blacklist.actions"
import { parseBlacklistItems } from "./utils/parseBlacklistItems"

type BlacklistSearchPatternAction = {
	type: "BlacklistSearchPatternAction"
	payload: { type: BlacklistType }
}

export const blacklistSearchPattern = (type: BlacklistType): BlacklistSearchPatternAction => ({
	type: "BlacklistSearchPatternAction",
	payload: { type }
})

@Injectable()
export class BlacklistSearchPatternEffect {
	constructor(
		@Inject(ActionsToken) private actions$: Actions,
		@Inject(Store) private store: Store,
		@Inject(AddBlacklistItemsIfNotResultsInEmptyMapEffect)
		private addBlacklistItemsIfNotResultsInEmptyMapEffect: AddBlacklistItemsIfNotResultsInEmptyMapEffect
	) {}

	private searchPattern$ = this.store.select(searchPatternSelector)

	private searchPattern2BlacklistItems$ = this.actions$.pipe(
		ofType<BlacklistSearchPatternAction>("BlacklistSearchPatternAction"),
		withLatestFrom(this.searchPattern$),
		map(([blacklistSearchPatternAction, searchPattern]) => ({
			type: blacklistSearchPatternAction.payload.type,
			blacklistItems: parseBlacklistItems(blacklistSearchPatternAction.payload.type, searchPattern)
		}))
	)

	flattenSearchPattern$ = createEffect(
		() =>
			this.searchPattern2BlacklistItems$.pipe(
				filter(searchPattern2BlacklistItems => searchPattern2BlacklistItems.type === "flatten"),
				tap(searchPattern2BlacklistItems => {
					this.store.dispatch(addBlacklistItems(searchPattern2BlacklistItems.blacklistItems))
					this.store.dispatch(setSearchPattern())
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
							this.store.dispatch(setSearchPattern())
						})
					)
					.subscribe()
			}),
			map(searchPattern2BlacklistItems => addBlacklistItemsIfNotResultsInEmptyMap(searchPattern2BlacklistItems.blacklistItems))
		)
	)
}
