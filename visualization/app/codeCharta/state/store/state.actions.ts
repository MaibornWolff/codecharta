import { CCAction, RecursivePartial, State } from "../../codeCharta.model"
import { defaultAppSettings } from "./appSettings/appSettings.actions"
import { defaultFileSettings } from "./fileSettings/fileSettings.actions"
import { defaultDynamicSettings } from "./dynamicSettings/dynamicSettings.actions"
import { defaultTreeMapSettings } from "./treeMap/treeMap.actions"

export enum StateActions {
	SET_STATE = "SET_STATE"
}

export interface SetStateAction extends CCAction {
	type: StateActions.SET_STATE
	payload: RecursivePartial<State>
}

export type StateAction = SetStateAction

export function setState(state: RecursivePartial<State> = defaultState): StateAction {
	return {
		type: StateActions.SET_STATE,
		payload: state
	}
}

export const defaultState: State = {
	appSettings: defaultAppSettings,
	fileSettings: defaultFileSettings,
	dynamicSettings: defaultDynamicSettings,
	treeMap: defaultTreeMapSettings
}
