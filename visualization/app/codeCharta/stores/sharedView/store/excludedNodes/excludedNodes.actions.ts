import { createAction, props } from "@ngrx/store"
import { ExcludedNode } from "../../../../model/codeCharta.model"

export const setExcludedNodes = createAction("SET_EXCLUDED_NODES", props<{ value: ExcludedNode[] }>())
export const addExcludedNodes = createAction("ADD_EXCLUDED_NODES", props<{ items: ExcludedNode[] }>())
export const removeExcludedNodes = createAction("REMOVE_EXCLUDED_NODES", props<{ items: ExcludedNode[] }>())
/** Excluding everything would leave an empty map, so this one is checked by an effect first. */
export const addExcludedNodesIfNotResultsInEmptyMap = createAction(
    "ADD_EXCLUDED_NODES_IF_NOT_RESULTS_IN_EMPTY_MAP",
    props<{ items: ExcludedNode[] }>()
)
