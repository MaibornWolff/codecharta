import { CCAction } from "../../../../codeCharta.model"

export enum AmountOfEdgePreviewsActions {
	SET_AMOUNT_OF_EDGE_PREVIEWS = "SET_AMOUNT_OF_EDGE_PREVIEWS",
	SET_DEFAULT_AMOUNT_OF_EDGE_PREVIEWS = "SET_DEFAULT_AMOUNT_OF_EDGE_PREVIEWS"
}

export interface SetAmountOfEdgePreviewsAction extends CCAction {
	type: AmountOfEdgePreviewsActions.SET_AMOUNT_OF_EDGE_PREVIEWS
	payload: number
}

export interface SetDefaultAmountOfEdgePreviewsAction extends CCAction {
	type: AmountOfEdgePreviewsActions.SET_DEFAULT_AMOUNT_OF_EDGE_PREVIEWS
	payload: number
}

export type AmountOfEdgePreviewsAction = SetAmountOfEdgePreviewsAction | SetDefaultAmountOfEdgePreviewsAction

export function setAmountOfEdgePreviews(amountOfEdgePreviews: number): AmountOfEdgePreviewsAction {
	return {
		type: AmountOfEdgePreviewsActions.SET_AMOUNT_OF_EDGE_PREVIEWS,
		payload: amountOfEdgePreviews
	}
}

export function setDefaultAmountOfEdgePreviews(): AmountOfEdgePreviewsAction {
	return {
		type: AmountOfEdgePreviewsActions.SET_DEFAULT_AMOUNT_OF_EDGE_PREVIEWS,
		payload: 1
	}
}
