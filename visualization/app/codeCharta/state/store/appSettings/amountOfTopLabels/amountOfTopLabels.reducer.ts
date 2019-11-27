import { AmountOfTopLabelsAction, AmountOfTopLabelsActions } from "./amountOfTopLabels.actions"

export function amountOfTopLabels(state: number = 1, action: AmountOfTopLabelsAction): number {
	switch (action.type) {
		case AmountOfTopLabelsActions.SET_AMOUNT_OF_TOP_LABELS:
			return action.payload
		default:
			return state
	}
}
