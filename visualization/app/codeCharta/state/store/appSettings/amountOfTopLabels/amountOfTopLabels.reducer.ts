import { AmountOfTopLabelsAction, AmountOfTopLabelsActions, setAmountOfTopLabels } from "./amountOfTopLabels.actions"

export function amountOfTopLabels(state: number = setAmountOfTopLabels().payload, action: AmountOfTopLabelsAction) {
	switch (action.type) {
		case AmountOfTopLabelsActions.SET_AMOUNT_OF_TOP_LABELS:
			return action.payload
		default:
			return state
	}
}
