import { isActionOfType } from "../../../../util/reduxHelper"
import { FilesAction, FilesSelectionActions } from "../../files/files.actions"
import { DynamicMarginAction, DynamicMarginActions, setDynamicMargin } from "./dynamicMargin.actions"

export function dynamicMargin(state = setDynamicMargin().payload, action: DynamicMarginAction | FilesAction) {
	if (isActionOfType(action.type, FilesSelectionActions)) {
		return true
	}

	switch (action.type) {
		case DynamicMarginActions.SET_DYNAMIC_MARGIN:
			return action.payload
		default:
			return state
	}
}
