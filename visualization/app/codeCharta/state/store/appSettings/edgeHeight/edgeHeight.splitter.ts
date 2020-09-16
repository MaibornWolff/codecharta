import { setEdgeHeight } from "./edgeHeight.actions"

export function splitEdgeHeightAction(payload: number) {
	return setEdgeHeight(payload)
}
