import { createReducer, on } from "@ngrx/store"
import { CcState } from "../../../../codeCharta.model"
import { setHoveredNodeId } from "./hoveredNodeId.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultHoveredNodeId: CcState["appStatus"]["hoveredNodeId"] = null
export const hoveredNodeId = createReducer(defaultHoveredNodeId, on(setHoveredNodeId, setState(defaultHoveredNodeId)))
