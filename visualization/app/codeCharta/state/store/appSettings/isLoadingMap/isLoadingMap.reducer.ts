import { isActionOfType } from "../../../../util/reduxHelper"
import { IsLoadingMapAction, IsLoadingMapActions, setIsLoadingMap } from "./isLoadingMap.actions"
import { actionsRequiringRerender } from "../../../effects/renderCodeMapEffect/actionsRequiringRerender"

export function isLoadingMap(state = setIsLoadingMap().payload, action: IsLoadingMapAction) {
	if (action.type === IsLoadingMapActions.SET_IS_LOADING_MAP) {
		return action.payload
	}

	if (actionsRequiringRerender.some(actions => isActionOfType(action.type, actions))) {
		return true
	}

	return state
}
