import { createReducer, on } from "@ngrx/store"
import { CcState } from "../../../../codeCharta.model"
import { setRightClickedNodeData } from "./rightClickedNodeData.actions"

export const defaultRightClickedNodeData: CcState["appStatus"]["rightClickedNodeData"] = null
export const rightClickedNodeData = createReducer(
    defaultRightClickedNodeData,
    on(setRightClickedNodeData, (_state, action) => action.value)
)
