import { createReducer, on } from "@ngrx/store"
import { LayoutAlgorithm } from "../../../../codeCharta.model"
import { setLayoutAlgorithm } from "./layoutAlgorithm.actions"

export const defaultLayoutAlgorithm = LayoutAlgorithm.SquarifiedTreeMap
export const layoutAlgorithm = createReducer(
	defaultLayoutAlgorithm,
	on(setLayoutAlgorithm, (_state, payload) => payload.value)
)
