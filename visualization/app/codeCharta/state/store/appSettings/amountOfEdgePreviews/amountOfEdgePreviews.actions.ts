import { Action } from "redux"

export enum AmountOfEdgePreviewsActions {
	SET_AMOUNT_OF_EDGE_PREVIEWS = "SET_AMOUNT_OF_EDGE_PREVIEWS"
}

export interface SetAmountOfEdgePreviewsAction extends Action {
	type: AmountOfEdgePreviewsActions.SET_AMOUNT_OF_EDGE_PREVIEWS
	payload: number
}

export type AmountOfEdgePreviewsAction = SetAmountOfEdgePreviewsAction

export function setAmountOfEdgePreviews(amountOfEdgePreviews: number): AmountOfEdgePreviewsAction {
	return {
		type: AmountOfEdgePreviewsActions.SET_AMOUNT_OF_EDGE_PREVIEWS,
		payload: amountOfEdgePreviews
	}
}
