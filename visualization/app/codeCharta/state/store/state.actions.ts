import { CCAction, RecursivePartial, State } from "../../codeCharta.model"

// Plop: Import sub-reducer here
import { defaultLookUp } from "./lookUp/lookUp.actions"
import { defaultAppSettings } from "./appSettings/appSettings.actions"
import { defaultFileSettings } from "./fileSettings/fileSettings.actions"
import { defaultDynamicSettings } from "./dynamicSettings/dynamicSettings.actions"
import { defaultTreeMapSettings } from "./treeMap/treeMap.actions"
import { defaultFiles } from "./files/files.actions"

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
	// Plop: Append sub-reducer here
	lookUp: defaultLookUp,
	appSettings: defaultAppSettings,
	fileSettings: defaultFileSettings,
	dynamicSettings: defaultDynamicSettings,
	treeMap: defaultTreeMapSettings,
	files: defaultFiles
}
