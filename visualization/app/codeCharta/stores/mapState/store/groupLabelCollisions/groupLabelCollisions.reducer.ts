import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setGroupLabelCollisions } from "./groupLabelCollisions.actions"

export const defaultGroupLabelCollisions = true
export const groupLabelCollisions = createReducer(
    defaultGroupLabelCollisions,
    on(setGroupLabelCollisions, setState(defaultGroupLabelCollisions))
)
