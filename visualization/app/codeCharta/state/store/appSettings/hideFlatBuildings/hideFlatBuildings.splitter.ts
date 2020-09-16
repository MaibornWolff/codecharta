import { setHideFlatBuildings } from "./hideFlatBuildings.actions"

export function splitHideFlatBuildingsAction(payload: boolean) {
	return setHideFlatBuildings(payload)
}
