import { CCAction } from "../../../../codeCharta.model"

export enum EdgeHeightActions {
	SET_EDGE_HEIGHT = "SET_EDGE_HEIGHT"
}

export interface SetEdgeHeightAction extends CCAction {
	type: EdgeHeightActions.SET_EDGE_HEIGHT
	payload: number
}

export type EdgeHeightAction = SetEdgeHeightAction

export function setEdgeHeight(edgeHeight: number = 4): EdgeHeightAction {
	return {
		type: EdgeHeightActions.SET_EDGE_HEIGHT,
		payload: edgeHeight
	}
}
