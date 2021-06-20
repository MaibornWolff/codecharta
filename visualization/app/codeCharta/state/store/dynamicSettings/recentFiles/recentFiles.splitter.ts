import { RecentFilesAction, setRecentFiles } from "./recentFiles.actions"

export function splitRecentFilesAction(payload: string[]): RecentFilesAction {
	return setRecentFiles(payload)
}
