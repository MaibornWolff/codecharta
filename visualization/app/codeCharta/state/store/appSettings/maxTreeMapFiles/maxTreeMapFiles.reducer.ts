import { MaxTreeMapFilesAction, MaxTreeMapFilesActions, setMaxTreeMapFiles } from "./maxTreeMapFiles.actions"

export function maxTreeMapFiles(state: number = setMaxTreeMapFiles().payload, action: MaxTreeMapFilesAction): number {
	switch (action.type) {
		case MaxTreeMapFilesActions.SET_MAX_TREE_MAP_FILES:
			return action.payload
		default:
			return state
	}
}
