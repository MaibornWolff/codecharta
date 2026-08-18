import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setStandard } from "../../../fileStore/fileStore.facade"
import { setDomainStateSearchPattern } from "./searchPattern.actions"

export const defaultSearchPattern = ""
export const searchPattern = createReducer(
    defaultSearchPattern,
    on(setDomainStateSearchPattern, setState(defaultSearchPattern)),
    on(setStandard, () => defaultSearchPattern)
)
