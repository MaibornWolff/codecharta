import { AmountOfEdgePreviewsAction, AmountOfEdgePreviewsActions, setAmountOfEdgePreviews } from "./amountOfEdgePreviews.actions"

export function amountOfEdgePreviews(state = setAmountOfEdgePreviews().payload, action: AmountOfEdgePreviewsAction) {
	switch (action.type) {
		case AmountOfEdgePreviewsActions.SET_AMOUNT_OF_EDGE_PREVIEWS:
			return action.payload
		default:
			return state
	}
}
