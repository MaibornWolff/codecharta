import { CCAction } from "../../../../codeCharta.model"

export enum AmountOfTopLabelsActions {
	SET_AMOUNT_OF_TOP_LABELS = "SET_AMOUNT_OF_TOP_LABELS"
}

export interface SetAmountOfTopLabelsAction extends CCAction {
	type: AmountOfTopLabelsActions.SET_AMOUNT_OF_TOP_LABELS
	payload: number
}

export type AmountOfTopLabelsAction = SetAmountOfTopLabelsAction

export function setAmountOfTopLabels(amountOfTopLabels: number = 1): AmountOfTopLabelsAction {
	return {
		type: AmountOfTopLabelsActions.SET_AMOUNT_OF_TOP_LABELS,
		payload: amountOfTopLabels
	}
}
