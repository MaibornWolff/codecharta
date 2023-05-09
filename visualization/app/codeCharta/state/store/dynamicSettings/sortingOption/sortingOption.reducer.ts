import { createReducer, on } from "@ngrx/store"
import { SortingOption } from "../../../../codeCharta.model"
import { setSortingOption } from "./sortingOption.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultSortingOption = SortingOption.NAME
export const sortingOption = createReducer(defaultSortingOption, on(setSortingOption, setState(defaultSortingOption)))
