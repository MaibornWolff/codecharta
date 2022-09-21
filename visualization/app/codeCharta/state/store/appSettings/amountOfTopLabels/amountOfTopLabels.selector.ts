import { createSelector } from "../../../angular-redux/createSelector"
import { appSettingsSelector } from "../appSettings.selector"
import { AppSettings } from "../../../../codeCharta.model"

import { numberOfFilesSelector } from "./numberOfFiles.selector"

const NUMBER_OF_BUILDINGS = 100
const DEFAULT_NUMBER_OF_LABELS = 1
const MAX_NUMBER_OF_LABELS = 10

export const getAmountOfTopLabels = (appSettings: Pick<AppSettings, "amountOfTopLabels">, numberOfFiles: any): number => {
	const { amountOfTopLabels } = appSettings
	const numberOfLabels = Math.floor(numberOfFiles.length / NUMBER_OF_BUILDINGS)
	if (numberOfLabels <= DEFAULT_NUMBER_OF_LABELS) {
		return amountOfTopLabels
	}
	if (numberOfLabels > DEFAULT_NUMBER_OF_LABELS && numberOfLabels <= MAX_NUMBER_OF_LABELS) {
		return numberOfLabels
	}
	return MAX_NUMBER_OF_LABELS
}

export const amountOfTopLabelsSelector = createSelector([appSettingsSelector, numberOfFilesSelector], getAmountOfTopLabels)
