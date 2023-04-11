import { createReducer, on } from "@ngrx/store"
import { CcState } from "../../../../codeCharta.model"
import { setSelectedBuildingId } from "./selectedBuildingId.actions"

export const defaultSelectedBuildingId: CcState["appStatus"]["selectedBuildingId"] = null
export const selectedBuildingId = createReducer(
	defaultSelectedBuildingId,
	on(setSelectedBuildingId, (_state, action) => action.value)
)
