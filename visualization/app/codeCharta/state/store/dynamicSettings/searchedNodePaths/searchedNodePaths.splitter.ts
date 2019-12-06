import { SearchedNodePathsAction, setSearchedNodePaths } from "./searchedNodePaths.actions"

export function splitSearchedNodePathsAction(payload: string[]): SearchedNodePathsAction {
	return setSearchedNodePaths(payload)
}
