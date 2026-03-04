import { createReducer, on } from "@ngrx/store"
import { setLabelMode } from "./labelMode.actions"
import { LabelMode } from "../../../../codeCharta.model"
import { setState } from "../../util/setState.reducer.factory"

export const defaultLabelMode = LabelMode.Height
export const labelMode = createReducer(defaultLabelMode, on(setLabelMode, setState(defaultLabelMode)))
