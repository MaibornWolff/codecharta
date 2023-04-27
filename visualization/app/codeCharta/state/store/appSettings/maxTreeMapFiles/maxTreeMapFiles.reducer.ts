import { createReducer, on } from "@ngrx/store"
import { setMaxTreeMapFiles } from "./maxTreeMapFiles.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultMaxTreeMapFiles = 100
export const maxTreeMapFiles = createReducer(defaultMaxTreeMapFiles, on(setMaxTreeMapFiles, setState(defaultMaxTreeMapFiles)))
