import { Inject, Injectable } from "@angular/core"
import { filter, map } from "rxjs"
import { isAction } from "../../../util/reduxHelper"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { Actions, ActionsToken } from "../../angular-redux/effects/effects.module"
import { IsLoadingFileActions, SetIsLoadingFileAction } from "../../store/appSettings/isLoadingFile/isLoadingFile.actions"
import { unfocusAllNodes } from "../../store/dynamicSettings/focusedNodePath/focusedNodePath.actions"

@Injectable()
export class UnfocusNodesOnLoadingMapEffect {
	constructor(@Inject(ActionsToken) private actions$: Actions) {}

	unfocusNodesOnLoadingMap$ = createEffect(() => {
		return this.actions$.pipe(
			filter(action => isAction<SetIsLoadingFileAction>(action, IsLoadingFileActions.SET_IS_LOADING_FILE) && action.payload === true),
			map(() => unfocusAllNodes())
		)
	})
}
