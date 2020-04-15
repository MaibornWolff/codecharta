import { CCAction } from "../../../../codeCharta.model"

export enum SearchedNodePathsActions {
	SET_SEARCHED_NODE_PATHS = "SET_SEARCHED_NODE_PATHS"
}

export interface SetSearchedNodePathsAction extends CCAction {
	type: SearchedNodePathsActions.SET_SEARCHED_NODE_PATHS
	payload: Set<string>
}

export type SearchedNodePathsAction = SetSearchedNodePathsAction

export function setSearchedNodePaths(searchedNodePaths: Set<string> = defaultSearchedNodePaths): SetSearchedNodePathsAction {
	return {
		type: SearchedNodePathsActions.SET_SEARCHED_NODE_PATHS,
		payload: searchedNodePaths
	}
}

export const defaultSearchedNodePaths = new Set<string>(["abc"])
