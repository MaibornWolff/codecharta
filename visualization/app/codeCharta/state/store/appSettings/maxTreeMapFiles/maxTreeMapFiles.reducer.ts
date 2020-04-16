import { MaxTreeMapFilesAction, MaxTreeMapFilesActions, setMaxTreeMapFiles } from "./maxTreeMapFiles.actions"
const clone = require("rfdc")()

export function maxTreeMapFiles(state: number = setMaxTreeMapFiles().payload, action: MaxTreeMapFilesAction): number {
	switch (action.type) {
		case MaxTreeMapFilesActions.SET_MAX_TREE_MAP_FILES:
			return clone(action.payload) //TODO: clone not required for primitives
		default:
			return state
	}
}
