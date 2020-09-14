import { SearchedNodePathsAction, SearchedNodePathsActions, setSearchedNodePaths } from "./searchedNodePaths.actions"

export function searchedNodePaths(state = setSearchedNodePaths().payload, action: SearchedNodePathsAction) {
	switch (action.type) {
		case SearchedNodePathsActions.SET_SEARCHED_NODE_PATHS:
			return new Set([...action.payload])
		default:
			return state
	}
}
