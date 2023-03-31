import { setIsLoadingMap } from "./isLoadingMap.actions"
import { createReducer, on } from "@ngrx/store"

export const defaultIsLoadingMap = true
export const isLoadingMap = createReducer(
	defaultIsLoadingMap,
	on(setIsLoadingMap, (_state, payload) => payload.value)
	// TODO this PR
	// if (actionsRequiringRerender.some(actions => isActionOfType(action.type, actions))) {
	// 	return true
	// }
)
