import { createReducer, on } from "@ngrx/store"
import { CcState } from "../../../../codeCharta.model"
import { setSelectedBuildingId } from "./selectedBuildingId.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultSelectedBuildingId: CcState["appStatus"]["selectedBuildingId"] = null
export const selectedBuildingId = createReducer(defaultSelectedBuildingId, on(setSelectedBuildingId, setState(defaultSelectedBuildingId)))
