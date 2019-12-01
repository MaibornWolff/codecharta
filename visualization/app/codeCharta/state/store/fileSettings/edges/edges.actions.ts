import { CCAction, Edge } from "../../../../codeCharta.model"

export enum EdgesActions {
	SET_EDGES = "SET_EDGES",
	ADD_EDGE = "ADD_EDGE",
	REMOVE_EDGE = "REMOVE_EDGE"
}

export interface SetEdgesAction extends CCAction {
	type: EdgesActions.SET_EDGES
	payload: Edge[]
}

export interface AddEdgeAction extends CCAction {
	type: EdgesActions.ADD_EDGE
	payload: Edge
}

export interface RemoveEdgeAction extends CCAction {
	type: EdgesActions.REMOVE_EDGE
	payload: Edge
}

export type EdgesAction = SetEdgesAction | AddEdgeAction | RemoveEdgeAction

export function setEdges(edges: Edge[]): EdgesAction {
	return {
		type: EdgesActions.SET_EDGES,
		payload: edges
	}
}

export function addEdge(edge: Edge): EdgesAction {
	return {
		type: EdgesActions.ADD_EDGE,
		payload: edge
	}
}

export function removeEdge(edge: Edge): EdgesAction {
	return {
		type: EdgesActions.REMOVE_EDGE,
		payload: edge
	}
}
