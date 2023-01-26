import { Inject, Injectable } from "@angular/core"
import { Actions, ActionsToken } from "../../angular-redux/effects/effects.module"
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { filter, map, tap, withLatestFrom } from "rxjs"
import {
	addBlacklistItems,
	AddBlacklistItemsIfNotResultsInEmptyMapAction,
	BlacklistActions
} from "../../store/fileSettings/blacklist/blacklist.actions"
import { visibleFileStatesSelector } from "../../selectors/visibleFileStates.selector"
import { blacklistSelector } from "../../store/fileSettings/blacklist/blacklist.selector"
import { Store } from "../../angular-redux/store"
import { resultsInEmptyMap } from "./resultsInEmptyMap"
import { ErrorDialogComponent } from "../../../ui/dialogs/errorDialog/errorDialog.component"
import { ofType } from "../../angular-redux/ofType"

@Injectable()
export class AddBlacklistItemsIfNotResultsInEmptyMapEffect {
	constructor(
		@Inject(ActionsToken) private actions$: Actions,
		@Inject(Store) private store: Store,
		@Inject(MatDialog) private dialog: MatDialog
	) {}

	private visibleFiles$ = this.store.select(visibleFileStatesSelector)
	private blacklist$ = this.store.select(blacklistSelector)

	doBlacklistItemsResultInEmptyMap$ = this.actions$.pipe(
		ofType<AddBlacklistItemsIfNotResultsInEmptyMapAction>(BlacklistActions.ADD_BLACKLIST_ITEMS_IF_NOT_RESULTS_IN_EMPTY_MAP),
		withLatestFrom(this.visibleFiles$, this.blacklist$),
		map(([addBlacklistItemsIfNotResultsInEmptyMapAction, visibleFiles, blacklist]) => ({
			items: addBlacklistItemsIfNotResultsInEmptyMapAction.payload,
			resultsInEmptyMap: resultsInEmptyMap(visibleFiles, blacklist, addBlacklistItemsIfNotResultsInEmptyMapAction.payload)
		}))
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
			map(event => addBlacklistItems(event.items))
		)
	)
}
