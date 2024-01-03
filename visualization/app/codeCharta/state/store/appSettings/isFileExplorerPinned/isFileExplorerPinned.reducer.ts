import { createReducer, on } from "@ngrx/store"
import { setIsFileExplorerPinned, toggleIsFileExplorerPinned } from "./isFileExplorerPinned.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultIsFileExplorerPinned = false
export const isFileExplorerPinned = createReducer(
	defaultIsFileExplorerPinned,
	on(setIsFileExplorerPinned, setState(defaultIsFileExplorerPinned)),
	on(toggleIsFileExplorerPinned, state => !state)
)
