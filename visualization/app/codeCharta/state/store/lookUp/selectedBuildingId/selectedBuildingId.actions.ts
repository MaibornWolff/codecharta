import { Action } from "redux"
import { SetIdToBuildingAction } from "../idToBuilding/idToBuilding.actions"

export enum SelectedBuildingIdActions {
	SET_SELECTED_BUILDING_ID = "SET_SELECTED_BUILDING_ID"
}

type InferredKeyOfMap<M> = M extends Map<infer K, unknown> ? K : never
export type SetSelectedBuildingIdPayload = InferredKeyOfMap<SetIdToBuildingAction["payload"]> | null

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
