import { Action } from "redux"

export enum SelectedBuildingIdActions {
	SET_SELECTED_BUILDING_ID = "SET_SELECTED_BUILDING_ID"
}

export type SetSelectedBuildingIdPayload = number | null

export interface SetSelectedBuildingIdAction extends Action {
	type: SelectedBuildingIdActions.SET_SELECTED_BUILDING_ID
	payload: SetSelectedBuildingIdPayload
}

export const defaultSelectedBuildingId: SetSelectedBuildingIdPayload = null

export const setSelectedBuildingId = (
	selectedBuilding: SetSelectedBuildingIdPayload = defaultSelectedBuildingId
): SetSelectedBuildingIdAction => ({
	type: SelectedBuildingIdActions.SET_SELECTED_BUILDING_ID,
	payload: selectedBuilding
})
