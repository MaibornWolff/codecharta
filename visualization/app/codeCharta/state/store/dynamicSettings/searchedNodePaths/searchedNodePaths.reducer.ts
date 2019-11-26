import { SearchedNodePathsAction, SearchedNodePathsActions } from "./searchedNodePaths.actions"

export function searchedNodePaths(state: string[] = [], action: SearchedNodePathsAction): string[] {
	switch (action.type) {
		case SearchedNodePathsActions.SET_SEARCHED_NODE_PATHS:
			return action.payload
		default:
			return state
	}
}
