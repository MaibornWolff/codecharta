import { AmountOfEdgePreviewsAction, AmountOfEdgePreviewsActions, setDefaultAmountOfEdgePreviews } from "./amountOfEdgePreviews.actions"

export function amountOfEdgePreviews(state: number = setDefaultAmountOfEdgePreviews().payload, action: AmountOfEdgePreviewsAction): number {
	switch (action.type) {
		case AmountOfEdgePreviewsActions.SET_AMOUNT_OF_EDGE_PREVIEWS:
		case AmountOfEdgePreviewsActions.SET_DEFAULT_AMOUNT_OF_EDGE_PREVIEWS:
			return action.payload
		default:
			return state
	}
}
