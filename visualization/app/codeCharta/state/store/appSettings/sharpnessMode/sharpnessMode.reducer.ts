import { createReducer, on } from "@ngrx/store"
import { SharpnessMode } from "../../../../codeCharta.model"
import { setSharpnessMode } from "./sharpnessMode.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultSharpnessMode = SharpnessMode.Standard
export const sharpnessMode = createReducer(defaultSharpnessMode, on(setSharpnessMode, setState(defaultSharpnessMode)))
