import { createAction, props } from "@ngrx/store"
import { CcState } from "../../../../model/codeCharta.model"

export const setRightClickedNodeData = createAction(
    "SET_RIGHT_CLICKED_NODE_DATA",
    props<{ value: CcState["sharedView"]["rightClickedNodeData"] }>()
)
