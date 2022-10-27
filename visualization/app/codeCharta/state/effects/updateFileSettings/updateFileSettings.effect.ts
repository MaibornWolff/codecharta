import { Injectable, Inject } from "@angular/core"
import { filter, map } from "rxjs"
import { getVisibleFiles, isPartialState } from "../../../model/files/files.helper"
import { isActionOfType } from "../../../util/reduxHelper"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { Actions, ActionsToken } from "../../angular-redux/effects/effects.module"
import { State } from "../../angular-redux/state"
import { FilesSelectionActions } from "../../store/files/files.actions"
import { setState } from "../../store/state.actions"
import { getMergedBlacklist } from "./utils/blacklist.merger"
import { getMergedEdges } from "./utils/edges.merger"
import { getMergedMarkedPackages } from "./utils/markedPackages.merger"

@Injectable()
export class UpdateFileSettingsEffect {
	constructor(@Inject(ActionsToken) private actions$: Actions, @Inject(State) private state: State) {}

	updateFileSettings$ = createEffect(() =>
		this.actions$.pipe(
			filter(action => isActionOfType(action.type, FilesSelectionActions)),
			map(() => {
				const { files } = this.state.getValue()
				const visibleFiles = getVisibleFiles(files)
				const withUpdatedPath = isPartialState(files)
				return setState({
					fileSettings: {
						edges: getMergedEdges(visibleFiles, withUpdatedPath),
						markedPackages: getMergedMarkedPackages(visibleFiles, withUpdatedPath),
						blacklist: getMergedBlacklist(visibleFiles, withUpdatedPath)
					}
				})
			})
		)
	)
}
