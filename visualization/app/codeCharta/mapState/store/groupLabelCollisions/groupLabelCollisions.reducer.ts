import { createReducer, on } from "@ngrx/store"
import { setGroupLabelCollisions } from "./groupLabelCollisions.actions"
import { setState } from "../../../state/store/util/setState.reducer.factory"

export const defaultGroupLabelCollisions = true
export const groupLabelCollisions = createReducer(
    defaultGroupLabelCollisions,
    on(setGroupLabelCollisions, setState(defaultGroupLabelCollisions))
)
