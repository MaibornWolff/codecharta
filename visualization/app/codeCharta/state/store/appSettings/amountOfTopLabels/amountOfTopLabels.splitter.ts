import { setAmountOfTopLabels } from "./amountOfTopLabels.actions"

export function splitAmountOfTopLabelsAction(payload: number) {
	return setAmountOfTopLabels(payload)
}
