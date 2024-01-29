import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { State } from "@ngrx/store"
import { CcState } from "app/codeCharta/codeCharta.model"
import { filter, tap } from "rxjs"
import { writeCcState } from "app/codeCharta/util/indexedDB/indexedDBWriter"
import { actionsRequiringSaveCcState } from "./actionsRequiringSaveCcState"
import { setHoveredNodeId } from "../../store/appStatus/hoveredNodeId/hoveredNodeId.actions"

@Injectable()
export class SaveCcStateEffect {
	constructor(private actions$: Actions, private state: State<CcState>) {}

	saveCcState$ = createEffect(
		() =>
			this.actions$.pipe(
				filter(action => action.type !== setHoveredNodeId.type),
				ofType(...actionsRequiringSaveCcState),
				tap(async () => {
					const state: CcState = this.state.getValue()
					await writeCcState(state)
				})
			),
		{ dispatch: false }
	)
}
