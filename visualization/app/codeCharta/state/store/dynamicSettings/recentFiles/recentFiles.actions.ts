import { Action } from "redux"

export enum RecentFilesActions {
	SET_RECENT_FILES = "SET_RECENT_FILES"
}

export interface SetRecentFilesAction extends Action {
	type: RecentFilesActions.SET_RECENT_FILES
	payload: string[]
}

export type RecentFilesAction = SetRecentFilesAction

export function setRecentFiles(recentFiles: string[] = defaultRecentFiles): SetRecentFilesAction {
	return {
		type: RecentFilesActions.SET_RECENT_FILES,
		payload: recentFiles
	}
}

export const defaultRecentFiles: string[] = []
