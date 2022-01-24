import { setInvertArea } from "./invertArea.actions"

export function splitInvertAreaAction(payload: boolean) {
	return setInvertArea(payload)
}
