import { LayoutAlgorithmAction, LayoutAlgorithmActions, setLayoutAlgorithm } from "./layoutAlgorithm.actions"
import { LayoutAlgorithm } from "../../../../codeCharta.model"

export function layoutAlgorithm(state: LayoutAlgorithm = setLayoutAlgorithm().payload, action: LayoutAlgorithmAction): LayoutAlgorithm {
	switch (action.type) {
		case LayoutAlgorithmActions.SET_LAYOUT_ALGORITHM:
			return action.payload
		default:
			return state
	}
}
