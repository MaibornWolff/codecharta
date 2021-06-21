import { RecentFilesAction, RecentFilesActions, setRecentFiles } from "./recentFiles.actions"

export function recentFiles(state = setRecentFiles().payload, action: RecentFilesAction) {
	switch (action.type) {
		case RecentFilesActions.SET_RECENT_FILES:
			return action.payload
		case RecentFilesActions.REMOVE_RECENT_FILE:
			return removeRecentFile(state, action.payload)
		default:
			return state
	}

	function removeRecentFile(state: string[], fileName: string) {
		return state.filter(file => file !== fileName)
	}
}
