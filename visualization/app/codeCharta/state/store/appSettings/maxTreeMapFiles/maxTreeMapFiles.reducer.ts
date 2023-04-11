import { createReducer, on } from "@ngrx/store"
import { setMaxTreeMapFiles } from "./maxTreeMapFiles.actions"

export const defaultMaxTreeMapFiles = 100
export const maxTreeMapFiles = createReducer(
	defaultMaxTreeMapFiles,
	on(setMaxTreeMapFiles, (_state, action) => action.value)
)
