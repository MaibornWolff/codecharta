import { EdgeHeightAction, setEdgeHeight } from "./edgeHeight.actions"

export function splitEdgeHeightAction(payload: number): EdgeHeightAction {
	return setEdgeHeight(payload)
}
