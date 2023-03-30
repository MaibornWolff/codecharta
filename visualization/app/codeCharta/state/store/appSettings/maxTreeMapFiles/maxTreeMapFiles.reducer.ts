import { createReducer, on } from "@ngrx/store"
import { setMaxTreeMapFiles } from "./maxTreeMapFiles.actions"

export const maxTreeMapFiles = createReducer(
	100,
	on(setMaxTreeMapFiles, (_state, payload) => payload.value)
)
