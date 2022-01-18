import { Inject } from "@angular/core"
import { filter, map } from "rxjs"
import { isActionOfType } from "../../util/reduxHelper"
import { createEffect } from "../angular-redux/effects/createEffect"
import { Actions, ActionsToken } from "../angular-redux/effects/effects.module"
import { IsLoadingFileActions } from "../store/appSettings/isLoadingFile/isLoadingFile.actions"
import { unfocusAllNodes } from "../store/dynamicSettings/focusedNodePath/focusedNodePath.actions"

export class UnfocusNodesOnLoadingMapEffect {
	constructor(@Inject(ActionsToken) private actions$: Actions) {}

	unfocusNodesOnLoadingMap$ = createEffect(() => {
		return this.actions$.pipe(
			filter(action => isActionOfType(action.type, IsLoadingFileActions)),
			map(() => unfocusAllNodes())
		)
	})
}
