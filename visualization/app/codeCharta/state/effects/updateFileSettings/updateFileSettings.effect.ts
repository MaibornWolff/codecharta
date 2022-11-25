import { Injectable, Inject } from "@angular/core"
import { filter, map } from "rxjs"
import { getVisibleFiles, isPartialState } from "../../../model/files/files.helper"
import { isActionOfType } from "../../../util/reduxHelper"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { Actions, ActionsToken } from "../../angular-redux/effects/effects.module"
import { State } from "../../angular-redux/state"
import { visibleFileStatesSelector } from "../../selectors/visibleFileStates.selector"
import { FilesSelectionActions } from "../../store/files/files.actions"
import { setState } from "../../store/state.actions"
import { getMergedAttributeTypes } from "./utils/attributeTypes.merger"
import { getMergedBlacklist } from "./utils/blacklist.merger"
import { getMergedEdges } from "./utils/edges.merger"
import { getMergedMarkedPackages } from "./utils/markedPackages.merger"
import { getMergedAttributeDescriptors } from "./utils/attributeDescriptors.merger"

@Injectable()
export class UpdateFileSettingsEffect {
	constructor(@Inject(ActionsToken) private actions$: Actions, @Inject(State) private state: State) {}

	updateFileSettings$ = createEffect(() =>
		this.actions$.pipe(
			filter(action => isActionOfType(action.type, FilesSelectionActions)),
			map(() => {
				const state = this.state.getValue()
				const visibleFiles = getVisibleFiles(state.files)
				const withUpdatedPath = isPartialState(state.files)
				const allAttributeTypes = visibleFileStatesSelector(state).map(({ file }) => file.settings.fileSettings.attributeTypes)
				const allAttributeDescriptors = visibleFileStatesSelector(state).map(
					({ file }) => file.settings.fileSettings.attributeDescriptors
				)
				return setState({
					fileSettings: {
						edges: getMergedEdges(visibleFiles, withUpdatedPath),
						markedPackages: getMergedMarkedPackages(visibleFiles, withUpdatedPath),
						blacklist: getMergedBlacklist(visibleFiles, withUpdatedPath),
						attributeTypes: getMergedAttributeTypes(allAttributeTypes),
						attributeDescriptors: getMergedAttributeDescriptors(allAttributeDescriptors)
					}
				})
			})
		)
	)
}
