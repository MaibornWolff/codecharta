import { IsLoadingFileAction, IsLoadingFileActions, setIsLoadingFile } from "./isLoadingFile.actions"

export function isLoadingFile(state: boolean = setIsLoadingFile().payload, action: IsLoadingFileAction): boolean {
	switch (action.type) {
		case IsLoadingFileActions.SET_IS_LOADING_FILE:
			return action.payload
		default:
			return state
	}
}
