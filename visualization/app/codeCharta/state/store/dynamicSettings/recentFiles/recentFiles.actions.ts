import { Action } from "redux"
import { CCAction } from "../../../../codeCharta.model"

export enum RecentFilesActions {
	SET_RECENT_FILES = "SET_RECENT_FILES",
	REMOVE_RECENT_FILE = "REMOVE_RECENT_FILE"
}

export interface SetRecentFilesAction extends Action {
	type: RecentFilesActions.SET_RECENT_FILES
	payload: string[]
}

export interface RemoveRecentFileAction extends CCAction {
	type: RecentFilesActions.REMOVE_RECENT_FILE
	payload: string
}

export type RecentFilesAction = SetRecentFilesAction | RemoveRecentFileAction

export function setRecentFiles(recentFiles: string[] = defaultRecentFiles): SetRecentFilesAction {
	return {
		type: RecentFilesActions.SET_RECENT_FILES,
		payload: recentFiles
	}
}

export function removeRecentFile(fileName: string): RemoveRecentFileAction {
	return {
		type: RecentFilesActions.REMOVE_RECENT_FILE,
		payload: fileName
	}
}

export const defaultRecentFiles: string[] = []
