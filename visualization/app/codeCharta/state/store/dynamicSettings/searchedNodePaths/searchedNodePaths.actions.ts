import { Action } from "redux"

export enum SearchedNodePathsActions {
	SET_SEARCHED_NODE_PATHS = "SET_SEARCHED_NODE_PATHS"
}

export interface SetSearchedNodePathsAction extends Action {
	type: SearchedNodePathsActions.SET_SEARCHED_NODE_PATHS
	payload: string[]
}

export type SearchedNodePathsAction = SetSearchedNodePathsAction

export function setSearchedNodePaths(searchedNodePaths: string[]): SearchedNodePathsAction {
	return {
		type: SearchedNodePathsActions.SET_SEARCHED_NODE_PATHS,
		payload: searchedNodePaths
	}
}
