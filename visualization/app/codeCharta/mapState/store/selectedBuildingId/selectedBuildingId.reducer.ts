import { createReducer, on } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { setSelectedBuildingId } from "./selectedBuildingId.actions"
import { setState } from "../../../state/store/util/setState.reducer.factory"

export const defaultSelectedBuildingId: CcState["mapState"]["selectedBuildingId"] = null
export const selectedBuildingId = createReducer(defaultSelectedBuildingId, on(setSelectedBuildingId, setState(defaultSelectedBuildingId)))
