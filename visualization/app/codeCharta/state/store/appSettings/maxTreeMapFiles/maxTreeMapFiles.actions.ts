import { CCAction } from "../../../../codeCharta.model"

export enum MaxTreeMapFilesActions {
	SET_MAX_TREE_MAP_FILES = "SET_MAX_TREE_MAP_FILES"
}

export interface SetMaxTreeMapFilesAction extends CCAction {
	type: MaxTreeMapFilesActions.SET_MAX_TREE_MAP_FILES
	payload: number
}

export type MaxTreeMapFilesAction = SetMaxTreeMapFilesAction

export function setMaxTreeMapFiles(maxTreeMapFiles: number = defaultMaxTreeMapFiles): SetMaxTreeMapFilesAction {
	return {
		type: MaxTreeMapFilesActions.SET_MAX_TREE_MAP_FILES,
		payload: maxTreeMapFiles
	}
}

export const defaultMaxTreeMapFiles = 100
