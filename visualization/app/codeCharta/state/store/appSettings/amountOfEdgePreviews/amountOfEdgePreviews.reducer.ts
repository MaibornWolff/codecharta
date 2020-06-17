import { AmountOfEdgePreviewsAction, AmountOfEdgePreviewsActions, setAmountOfEdgePreviews } from "./amountOfEdgePreviews.actions"

export function amountOfEdgePreviews(state: number = setAmountOfEdgePreviews().payload, action: AmountOfEdgePreviewsAction): number {
	switch (action.type) {
		case AmountOfEdgePreviewsActions.SET_AMOUNT_OF_EDGE_PREVIEWS:
			return action.payload
		default:
			return state
	}
}
