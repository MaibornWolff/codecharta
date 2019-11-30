import { Action } from "redux"
import { DynamicSettings } from "../../../codeCharta.model"

export enum DynamicSettingsActions {
	SET_DYNAMIC_SETTINGS = "SET_DYNAMIC_SETTINGS"
}

export interface SetDynamicSettingsAction extends Action {
	type: DynamicSettingsActions.SET_DYNAMIC_SETTINGS
	payload: DynamicSettings
}

export type DynamicSettingsAction = SetDynamicSettingsAction

export function setDynamicSettings(dynamicSettings: DynamicSettings): DynamicSettingsAction {
	return {
		type: DynamicSettingsActions.SET_DYNAMIC_SETTINGS,
		payload: dynamicSettings
	}
}
