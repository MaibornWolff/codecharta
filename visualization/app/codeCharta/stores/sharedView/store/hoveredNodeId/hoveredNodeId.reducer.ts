import { createReducer, on } from "@ngrx/store"
import { CcState } from "../../../../model/codeCharta.model"
import { setState } from "../../../../util/setState.reducer.factory"
import { setHoveredNodeId } from "./hoveredNodeId.actions"

export const defaultHoveredNodeId: CcState["sharedView"]["hoveredNodeId"] = null
export const hoveredNodeId = createReducer(defaultHoveredNodeId, on(setHoveredNodeId, setState(defaultHoveredNodeId)))
