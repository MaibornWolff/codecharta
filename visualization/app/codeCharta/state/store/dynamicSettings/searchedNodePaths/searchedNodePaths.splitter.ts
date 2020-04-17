import { SearchedNodePathsAction, setSearchedNodePaths } from "./searchedNodePaths.actions"

export function splitSearchedNodePathsAction(payload: Set<string>): SearchedNodePathsAction {
	return setSearchedNodePaths(payload)
}
