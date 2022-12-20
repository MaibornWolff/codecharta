import { CCAction } from "../../../../codeCharta.model"

export enum EnableFloorLabelsActions {
	SET_ENABLE_FLOOR_LABELS = "SET_ENABLE_FLOOR_LABELS"
}

export interface SetEnableFloorLabelsAction extends CCAction {
	type: EnableFloorLabelsActions.SET_ENABLE_FLOOR_LABELS
	payload: boolean
}

export type EnableFloorLabelAction = SetEnableFloorLabelsAction

export function setEnableFloorLabels(enableFloorLabel: boolean = defaultEnableFloorLabel): SetEnableFloorLabelsAction {
	return {
		type: EnableFloorLabelsActions.SET_ENABLE_FLOOR_LABELS,
		payload: enableFloorLabel
	}
}

export const defaultEnableFloorLabel = true
