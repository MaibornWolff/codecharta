import { createReducer, on } from "@ngrx/store"
import { CcState } from "../../../../model/codeCharta.model"
import { setState } from "../../../../util/setState.reducer.factory"
import { setHoveredNodePath } from "./hoveredNodePath.actions"

export const defaultHoveredNodePath: CcState["sharedView"]["hoveredNodePath"] = null
export const hoveredNodePath = createReducer(defaultHoveredNodePath, on(setHoveredNodePath, setState(defaultHoveredNodePath)))
