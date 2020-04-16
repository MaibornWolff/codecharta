import {
	IsAttributeSideBarVisibleAction,
	IsAttributeSideBarVisibleActions,
	setIsAttributeSideBarVisible
} from "./isAttributeSideBarVisible.actions"

export function isAttributeSideBarVisible(
	state: boolean = setIsAttributeSideBarVisible().payload,
	action: IsAttributeSideBarVisibleAction
): boolean {
	switch (action.type) {
		case IsAttributeSideBarVisibleActions.OPEN_ATTRIBUTE_SIDE_BAR:
			return true
		case IsAttributeSideBarVisibleActions.CLOSE_ATTRIBUTE_SIDE_BAR:
			return false
		case IsAttributeSideBarVisibleActions.SET_IS_ATTRIBUTE_SIDE_BAR_VISIBLE:
			return action.payload
		default:
			return state
	}
}
