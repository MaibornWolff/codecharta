import { SearchedNodePathsAction, SearchedNodePathsActions, setSearchedNodePaths } from "./searchedNodePaths.actions"

export function searchedNodePaths(state = setSearchedNodePaths().payload, action: SearchedNodePathsAction) {
	switch (action.type) {
		case SearchedNodePathsActions.SET_SEARCHED_NODE_PATHS:
			if (action.payload.size > 0) {
				return new Set([...action.payload])
			}
			return new Set()
		default:
			return state
	}
}
