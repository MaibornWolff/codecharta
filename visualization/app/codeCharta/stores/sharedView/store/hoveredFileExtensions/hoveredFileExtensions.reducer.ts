import { createReducer, on } from "@ngrx/store"
import { CcState } from "../../../../model/codeCharta.model"
import { setState } from "../../../../util/setState.reducer.factory"
import { setHoveredFileExtensions } from "./hoveredFileExtensions.actions"

export const defaultHoveredFileExtensions: CcState["sharedView"]["hoveredFileExtensions"] = []
export const hoveredFileExtensions = createReducer(
    defaultHoveredFileExtensions,
    on(setHoveredFileExtensions, setState(defaultHoveredFileExtensions))
)
