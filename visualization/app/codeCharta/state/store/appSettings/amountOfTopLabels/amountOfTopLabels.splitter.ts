import { AmountOfTopLabelsAction, setAmountOfTopLabels } from "./amountOfTopLabels.actions"

export function splitAmountOfTopLabelsAction(payload: number): AmountOfTopLabelsAction {
	return setAmountOfTopLabels(payload)
}
