import { setAmountOfEdgePreviews } from "./amountOfEdgePreviews.actions"

export function splitAmountOfEdgePreviewsAction(payload: number) {
	return setAmountOfEdgePreviews(payload)
}
