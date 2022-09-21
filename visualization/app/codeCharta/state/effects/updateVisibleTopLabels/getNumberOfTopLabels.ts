import { defaultAmountOfTopLabels } from "../../store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"

const BUILDINGS_PER_LABEL = 100
const MAX_NUMBER_OF_LABELS = 10

export const getNumberOfTopLabels = (numberOfFiles: any) => {
	const numberOfLabels = Math.floor(numberOfFiles.length / BUILDINGS_PER_LABEL)
	if (numberOfLabels <= defaultAmountOfTopLabels) {
		return defaultAmountOfTopLabels
	}
	return Math.min(numberOfLabels, MAX_NUMBER_OF_LABELS)
}
