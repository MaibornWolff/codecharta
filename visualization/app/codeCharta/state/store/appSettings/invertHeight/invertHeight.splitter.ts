import { setInvertHeight } from "./invertHeight.actions"

export function splitInvertHeightAction(payload: boolean) {
	return setInvertHeight(payload)
}
