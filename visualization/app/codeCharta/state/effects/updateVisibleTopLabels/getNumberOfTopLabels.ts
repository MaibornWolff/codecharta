import { defaultAmountOfTopLabels } from "../../store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"
import { CodeMapNode } from "../../../codeCharta.model"

const BUILDINGS_PER_LABEL = 100
const MAX_NUMBER_OF_LABELS = 10

export const getNumberOfTopLabels = (codeMapNodes: CodeMapNode[]) => {
	const numberOfLabels = Math.floor(codeMapNodes.length / BUILDINGS_PER_LABEL)
	if (numberOfLabels <= defaultAmountOfTopLabels) {
		return defaultAmountOfTopLabels
	}
	return Math.min(numberOfLabels, MAX_NUMBER_OF_LABELS)
}
