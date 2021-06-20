import { RecentFilesAction, RecentFilesActions, setRecentFiles } from "./recentFiles.actions"

export function recentFiles(state = setRecentFiles().payload, action: RecentFilesAction) {
	switch (action.type) {
		case RecentFilesActions.SET_RECENT_FILES:
			return action.payload
		default:
			return state
	}
}
