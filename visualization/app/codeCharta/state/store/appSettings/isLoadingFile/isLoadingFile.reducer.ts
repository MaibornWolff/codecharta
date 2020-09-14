import { IsLoadingFileAction, IsLoadingFileActions, setIsLoadingFile } from "./isLoadingFile.actions"

export function isLoadingFile(state = setIsLoadingFile().payload, action: IsLoadingFileAction) {
	switch (action.type) {
		case IsLoadingFileActions.SET_IS_LOADING_FILE:
			return action.payload
		default:
			return state
	}
}
