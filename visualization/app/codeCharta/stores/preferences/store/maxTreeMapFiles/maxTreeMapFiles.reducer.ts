import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setMaxTreeMapFiles } from "./maxTreeMapFiles.actions"

export const defaultMaxTreeMapFiles = 100
export const maxTreeMapFiles = createReducer(defaultMaxTreeMapFiles, on(setMaxTreeMapFiles, setState(defaultMaxTreeMapFiles)))
