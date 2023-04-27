import { createReducer, on } from "@ngrx/store"
import { LayoutAlgorithm } from "../../../../codeCharta.model"
import { setLayoutAlgorithm } from "./layoutAlgorithm.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultLayoutAlgorithm = LayoutAlgorithm.SquarifiedTreeMap
export const layoutAlgorithm = createReducer(defaultLayoutAlgorithm, on(setLayoutAlgorithm, setState(defaultLayoutAlgorithm)))
