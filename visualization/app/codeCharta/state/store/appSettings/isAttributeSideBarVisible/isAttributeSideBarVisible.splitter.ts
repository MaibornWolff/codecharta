import { IsAttributeSideBarVisibleAction, setIsAttributeSideBarVisible } from "./isAttributeSideBarVisible.actions"

export function splitIsAttributeSideBarVisibleAction(payload: boolean): IsAttributeSideBarVisibleAction {
	return setIsAttributeSideBarVisible(payload)
}
