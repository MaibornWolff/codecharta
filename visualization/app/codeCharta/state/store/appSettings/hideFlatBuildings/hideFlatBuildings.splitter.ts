import { HideFlatBuildingsAction, setHideFlatBuildings } from "./hideFlatBuildings.actions"

export function splitHideFlatBuildingsAction(payload: boolean): HideFlatBuildingsAction {
	return setHideFlatBuildings(payload)
}
