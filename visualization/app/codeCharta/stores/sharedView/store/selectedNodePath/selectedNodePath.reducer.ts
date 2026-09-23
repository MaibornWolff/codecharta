import { createReducer, on } from "@ngrx/store"
import { CcState } from "../../../../model/codeCharta.model"
import { setState } from "../../../../util/setState.reducer.factory"
import { setSelectedNodePath } from "./selectedNodePath.actions"

export const defaultSelectedNodePath: CcState["sharedView"]["selectedNodePath"] = null
export const selectedNodePath = createReducer(defaultSelectedNodePath, on(setSelectedNodePath, setState(defaultSelectedNodePath)))
