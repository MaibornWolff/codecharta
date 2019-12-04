import { CCAction } from "../../../../codeCharta.model"

export enum EdgeHeightActions {
	SET_EDGE_HEIGHT = "SET_EDGE_HEIGHT"
}

export interface SetEdgeHeightAction extends CCAction {
	type: EdgeHeightActions.SET_EDGE_HEIGHT
	payload: number
}

export type EdgeHeightAction = SetEdgeHeightAction

export function setEdgeHeight(edgeHeight: number = defaultEdgeHeight): SetEdgeHeightAction {
	return {
		type: EdgeHeightActions.SET_EDGE_HEIGHT,
		payload: edgeHeight
	}
}

export const defaultEdgeHeight = 4
