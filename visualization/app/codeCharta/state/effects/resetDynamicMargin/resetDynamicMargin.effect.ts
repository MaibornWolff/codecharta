import { Inject, Injectable } from "@angular/core"
import { filter, map } from "rxjs"
import { isActionOfType } from "../../../util/reduxHelper"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { Actions, ActionsToken } from "../../angular-redux/effects/effects.module"
import { setDynamicMargin } from "../../store/appSettings/dynamicMargin/dynamicMargin.actions"
import { FilesSelectionActions } from "../../store/files/files.actions"

@Injectable()
export class ResetDynamicMarginEffect {
	constructor(@Inject(ActionsToken) private actions$: Actions) {}

	resetDynamicMargin$ = createEffect(() =>
		this.actions$.pipe(
			filter(action => isActionOfType(action.type, FilesSelectionActions)),
			map(() => setDynamicMargin(true))
		)
	)
}
