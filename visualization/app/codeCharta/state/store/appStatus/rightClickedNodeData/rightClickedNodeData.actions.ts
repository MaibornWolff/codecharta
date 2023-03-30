import { createAction, props } from "@ngrx/store"
import { State } from "../../../../codeCharta.model"

export const setRightClickedNodeData = createAction(
	"SET_RIGHT_CLICKED_NODE_DATA",
	props<{ value: State["appStatus"]["rightClickedNodeData"] }>()
)
