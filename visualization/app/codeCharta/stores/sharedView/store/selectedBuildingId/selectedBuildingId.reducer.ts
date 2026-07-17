import { createReducer, on } from "@ngrx/store"
import { CcState } from "../../../../model/codeCharta.model"
import { setState } from "../../../../util/setState.reducer.factory"
import { setSelectedBuildingId } from "./selectedBuildingId.actions"

export const defaultSelectedBuildingId: CcState["sharedView"]["selectedBuildingId"] = null
export const selectedBuildingId = createReducer(defaultSelectedBuildingId, on(setSelectedBuildingId, setState(defaultSelectedBuildingId)))
