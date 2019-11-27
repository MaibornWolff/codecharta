import { EdgeHeightAction, EdgeHeightActions } from "./edgeHeight.actions"

export function edgeHeight(state: number = 4, action: EdgeHeightAction): number {
	switch (action.type) {
		case EdgeHeightActions.SET_EDGE_HEIGHT:
			return action.payload
		default:
			return state
	}
}
