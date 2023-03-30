import { Injectable } from "@angular/core"
import { Actions } from "@ngrx/effects"
// import { FilesSelectionActions } from "../../store/files/files.actions"
// import { setState } from "../../store/state.actions"
import { State as StateService } from "@ngrx/store"
import { State } from "../../../codeCharta.model"

@Injectable()
export class UpdateFileSettingsEffect {
	constructor(private actions$: Actions, private state: StateService<State>) {}

	// updateFileSettings$ = createEffect(() =>
	// 	this.actions$.pipe(
	// 		filter(action => isActionOfType(action.type, FilesSelectionActions)),
	// 		map(() => {
	// 			const state = this.state.getValue()
	// 			const visibleFiles = getVisibleFiles(state.files)
	// 			const withUpdatedPath = isPartialState(state.files)
	// 			const allAttributeTypes = visibleFileStatesSelector(state).map(({ file }) => file.settings.fileSettings.attributeTypes)
	// 			const allAttributeDescriptors = visibleFileStatesSelector(state).map(
	// 				({ file }) => file.settings.fileSettings.attributeDescriptors
	// 			)

	// 			// TODO setState!
	// 			return setState({
	// 				fileSettings: {
	// 					edges: getMergedEdges(visibleFiles, withUpdatedPath),
	// 					markedPackages: getMergedMarkedPackages(visibleFiles, withUpdatedPath),
	// 					blacklist: getMergedBlacklist(visibleFiles, withUpdatedPath),
	// 					attributeTypes: getMergedAttributeTypes(allAttributeTypes),
	// 					attributeDescriptors: getMergedAttributeDescriptors(allAttributeDescriptors)
	// 				}
	// 			})
	// 		})
	// 	)
	// )
}
