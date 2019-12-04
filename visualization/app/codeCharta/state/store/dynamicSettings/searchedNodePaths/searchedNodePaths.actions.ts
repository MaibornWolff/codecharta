import { CCAction } from "../../../../codeCharta.model"

export enum SearchedNodePathsActions {
	SET_SEARCHED_NODE_PATHS = "SET_SEARCHED_NODE_PATHS"
}

export interface SetSearchedNodePathsAction extends CCAction {
	type: SearchedNodePathsActions.SET_SEARCHED_NODE_PATHS
	payload: string[]
}

export type SearchedNodePathsAction = SetSearchedNodePathsAction

export function setSearchedNodePaths(searchedNodePaths: string[] = []): SetSearchedNodePathsAction {
	return {
		type: SearchedNodePathsActions.SET_SEARCHED_NODE_PATHS,
		payload: searchedNodePaths
	}
}
