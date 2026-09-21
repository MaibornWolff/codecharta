import { createAction, props } from "@ngrx/store"
import { FlattenedNode } from "../../../../model/codeCharta.model"

export const setFlattenedNodes = createAction("SET_FLATTENED_NODES", props<{ value: FlattenedNode[] }>())
export const addFlattenedNodes = createAction("ADD_FLATTENED_NODES", props<{ items: FlattenedNode[] }>())
export const removeFlattenedNodes = createAction("REMOVE_FLATTENED_NODES", props<{ items: FlattenedNode[] }>())
