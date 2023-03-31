import { createReducer, on } from "@ngrx/store"
import { setIsLoadingFile } from "./isLoadingFile.actions"

export const isLoadingFile = createReducer(
	true,
	on(setIsLoadingFile, (_state, payload) => payload.value)
	// TODO this PR
	// if (isActionOfType(action.type, FilesSelectionActions)) {
	// 	return true
	// }
)
