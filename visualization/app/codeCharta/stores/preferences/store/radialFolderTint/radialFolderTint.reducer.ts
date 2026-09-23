import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setRadialFolderTint } from "./radialFolderTint.actions"

export const defaultRadialFolderTint = 0.5
export const radialFolderTint = createReducer(defaultRadialFolderTint, on(setRadialFolderTint, setState(defaultRadialFolderTint)))
