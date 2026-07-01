import { createAction, props } from "@ngrx/store"

export const setGroupLabelCollisions = createAction("SET_GROUP_LABEL_COLLISIONS", props<{ value: boolean }>())
