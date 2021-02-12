import { CCAction, LayoutAlgorithm } from "../../../../codeCharta.model"

export enum LayoutAlgorithmActions {
	SET_LAYOUT_ALGORITHM = "SET_LAYOUT_ALGORITHM"
}

export interface SetLayoutAlgorithmAction extends CCAction {
	type: LayoutAlgorithmActions.SET_LAYOUT_ALGORITHM
	payload: LayoutAlgorithm
}

export type LayoutAlgorithmAction = SetLayoutAlgorithmAction

export function setLayoutAlgorithm(layoutAlgorithm: LayoutAlgorithm = defaultLayoutAlgorithm): SetLayoutAlgorithmAction {
	return {
		type: LayoutAlgorithmActions.SET_LAYOUT_ALGORITHM,
		payload: layoutAlgorithm
	}
}

export const defaultLayoutAlgorithm: LayoutAlgorithm = LayoutAlgorithm.SquarifiedTreeMap
