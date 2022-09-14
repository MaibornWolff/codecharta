import { isActionOfType } from "../../../../util/reduxHelper"
import { FilesSelectionActions } from "../../files/files.actions"
import { defaultIsLoadingFile, IsLoadingFileAction, IsLoadingFileActions } from "./isLoadingFile.actions"

export function isLoadingFile(state = defaultIsLoadingFile, action: IsLoadingFileAction) {
	if (action.type === IsLoadingFileActions.SET_IS_LOADING_FILE) {
		return action.payload
	}

	if (isActionOfType(action.type, FilesSelectionActions)) {
		return true
	}

	return state
}
