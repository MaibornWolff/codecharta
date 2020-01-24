import { Action } from "redux"
import { FileState } from "../../../../codeCharta.model"

export enum FilesActions {
	SET_FILES = "SET_FILES"
}

export interface SetFilesAction extends Action {
	type: FilesActions.SET_FILES
	payload: FileState[]
}

export type FilesAction = SetFilesAction

export function setFiles(files: FileState[] = defaultFiles): SetFilesAction {
	return {
		type: FilesActions.SET_FILES,
		payload: files
	}
}

export const defaultFiles: FileState[] = []
