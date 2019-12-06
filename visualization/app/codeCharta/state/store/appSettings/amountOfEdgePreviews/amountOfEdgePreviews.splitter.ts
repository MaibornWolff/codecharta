import { AmountOfEdgePreviewsAction, setAmountOfEdgePreviews } from "./amountOfEdgePreviews.actions"

export function splitAmountOfEdgePreviewsAction(payload: number): AmountOfEdgePreviewsAction {
	return setAmountOfEdgePreviews(payload)
}
