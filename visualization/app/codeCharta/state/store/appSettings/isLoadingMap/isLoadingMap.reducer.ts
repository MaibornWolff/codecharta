import { setIsLoadingMap } from "./isLoadingMap.actions"
import { createReducer, on } from "@ngrx/store"

export const isLoadingMap = createReducer(
	true,
	on(setIsLoadingMap, (_state, payload) => payload.value)
	// TODO this PR
	// if (actionsRequiringRerender.some(actions => isActionOfType(action.type, actions))) {
	// 	return true
	// }
)
