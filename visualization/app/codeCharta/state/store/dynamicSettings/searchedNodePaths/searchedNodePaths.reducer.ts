import { SearchedNodePathsAction, SearchedNodePathsActions, setSearchedNodePaths } from "./searchedNodePaths.actions"

export function searchedNodePaths(state: Set<string> = setSearchedNodePaths().payload, action: SearchedNodePathsAction): Set<string> {
	switch (action.type) {
		case SearchedNodePathsActions.SET_SEARCHED_NODE_PATHS:
			return new Set(Array.from(action.payload))
		default:
			return state
	}
}
