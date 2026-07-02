import { createReducer, on } from "@ngrx/store"
import { LayoutAlgorithm } from "../../../codeCharta.model"
import { setLayoutAlgorithm } from "./layoutAlgorithm.actions"
import { setState } from "../../../state/store/util/setState.reducer.factory"

export const defaultLayoutAlgorithm = LayoutAlgorithm.SquarifiedTreeMap
export const layoutAlgorithm = createReducer(defaultLayoutAlgorithm, on(setLayoutAlgorithm, setState(defaultLayoutAlgorithm)))
