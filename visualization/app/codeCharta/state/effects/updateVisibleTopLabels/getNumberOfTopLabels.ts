import { defaultAmountOfTopLabels } from "../../store/appSettings/amountOfTopLabels/amountOfTopLabels.reducer"

const BUILDINGS_PER_LABEL = 100
const MAX_NUMBER_OF_LABELS = 10

export const getNumberOfTopLabels = (codeMapNodes: { length: number }) => {
	const numberOfLabels = Math.floor(codeMapNodes.length / BUILDINGS_PER_LABEL)
	if (numberOfLabels <= defaultAmountOfTopLabels) {
		return defaultAmountOfTopLabels
	}
	return Math.min(numberOfLabels, MAX_NUMBER_OF_LABELS)
}
