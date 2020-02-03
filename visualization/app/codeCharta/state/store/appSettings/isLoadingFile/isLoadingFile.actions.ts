import { Action } from "redux"

export enum IsLoadingFileActions {
	SET_IS_LOADING_FILE = "SET_IS_LOADING_FILE"
}

export interface SetIsLoadingFileAction extends Action {
	type: IsLoadingFileActions.SET_IS_LOADING_FILE
	payload: boolean
}

export type IsLoadingFileAction = SetIsLoadingFileAction

export function setIsLoadingFile(isLoadingFile: boolean = defaultIsLoadingFile): SetIsLoadingFileAction {
	return {
		type: IsLoadingFileActions.SET_IS_LOADING_FILE,
		payload: isLoadingFile
	}
}

export const defaultIsLoadingFile: boolean = true
