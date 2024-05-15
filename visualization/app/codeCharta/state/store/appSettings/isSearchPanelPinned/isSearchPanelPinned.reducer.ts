import { createReducer, on } from "@ngrx/store"
import { setIsSearchPanelPinned, toggleIsSearchPanelPinned } from "./isSearchPanelPinned.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultIsSearchPanelPinned = false
export const isSearchPanelPinned = createReducer(
    defaultIsSearchPanelPinned,
    on(setIsSearchPanelPinned, setState(defaultIsSearchPanelPinned)),
    on(toggleIsSearchPanelPinned, state => !state)
)
