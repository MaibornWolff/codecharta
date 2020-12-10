import { LayoutAlgorithmAction, setLayoutAlgorithm } from "./layoutAlgorithm.actions"
import { LayoutAlgorithm } from "../../../../codeCharta.model"

export function splitLayoutAlgorithmAction(payload: LayoutAlgorithm): LayoutAlgorithmAction {
	return setLayoutAlgorithm(payload)
}
