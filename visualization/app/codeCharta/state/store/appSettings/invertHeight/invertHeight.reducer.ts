import { InvertHeightAction, InvertHeightActions, setInvertHeight } from "./invertHeight.actions"

export function invertHeight(state = setInvertHeight().payload, action: InvertHeightAction) {
	switch (action.type) {
		case InvertHeightActions.SET_INVERT_HEIGHT:
			return action.payload
		default:
			return state
	}
}
