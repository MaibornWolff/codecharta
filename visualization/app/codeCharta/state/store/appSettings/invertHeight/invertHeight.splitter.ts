import { InvertHeightAction, setInvertHeight } from "./invertHeight.actions"

export function splitInvertHeightAction(payload: boolean): InvertHeightAction {
	return setInvertHeight(payload)
}
