import { createReducer, on } from "@ngrx/store"
import { LabelMode } from "../../../../model/codeCharta.model"
import { setState } from "../../../../util/setState.reducer.factory"
import { setLabelMode } from "./labelMode.actions"

export const defaultLabelMode = LabelMode.Height
export const labelMode = createReducer(defaultLabelMode, on(setLabelMode, setState(defaultLabelMode)))
