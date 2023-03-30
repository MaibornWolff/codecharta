import { createReducer, on } from "@ngrx/store"
import { LayoutAlgorithm } from "../../../../codeCharta.model"
import { setLayoutAlgorithm } from "./layoutAlgorithm.actions"

export const layoutAlgorithm = createReducer(
	LayoutAlgorithm.SquarifiedTreeMap,
	on(setLayoutAlgorithm, (_state, payload) => payload.value)
)
