import { setIsAttributeSideBarVisible } from "./isAttributeSideBarVisible.actions"

export function splitIsAttributeSideBarVisibleAction(payload: boolean) {
	return setIsAttributeSideBarVisible(payload)
}
