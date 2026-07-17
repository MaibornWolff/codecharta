import { createReducer, on } from "@ngrx/store"
import { LayoutAlgorithm } from "../../../../model/codeCharta.model"
import { setState } from "../../../../util/setState.reducer.factory"
import { setLayoutAlgorithm } from "./layoutAlgorithm.actions"

export const defaultLayoutAlgorithm = LayoutAlgorithm.SquarifiedTreeMap
export const layoutAlgorithm = createReducer(defaultLayoutAlgorithm, on(setLayoutAlgorithm, setState(defaultLayoutAlgorithm)))
