import { setSearchedNodePaths } from "./searchedNodePaths.actions"

export function splitSearchedNodePathsAction(payload: Set<string>) {
	return setSearchedNodePaths(payload)
}
