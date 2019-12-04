import { InvertHeightAction, InvertHeightActions, setInvertHeight } from "./invertHeight.actions"

export function invertHeight(state: boolean = setInvertHeight().payload, action: InvertHeightAction): boolean {
	switch (action.type) {
		case InvertHeightActions.SET_INVERT_HEIGHT:
			return action.payload
		default:
			return state
	}
}
