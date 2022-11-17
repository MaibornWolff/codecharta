import { CCAction, RecursivePartial, State } from "../../codeCharta.model"

import { defaultAppSettings } from "./appSettings/appSettings.actions"
import { defaultFileSettings } from "./fileSettings/fileSettings.actions"
import { defaultDynamicSettings } from "./dynamicSettings/dynamicSettings.actions"
import { defaultFiles } from "./files/files.actions"
import { defaultHoveredNodeId } from "./appStatus/hoveredNodeId/hoveredNodeId.actions"
import { defaultSelectedBuildingId } from "./appStatus/selectedBuildingId/selectedBuildingId.actions"
import { defaultRightClickedNodeData } from "./appStatus/rightClickedNodeData/rightClickedNodeData.actions"

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
	files: defaultFiles,
	appStatus: {
		hoveredNodeId: defaultHoveredNodeId,
		selectedBuildingId: defaultSelectedBuildingId,
		rightClickedNodeData: defaultRightClickedNodeData
	}
}
