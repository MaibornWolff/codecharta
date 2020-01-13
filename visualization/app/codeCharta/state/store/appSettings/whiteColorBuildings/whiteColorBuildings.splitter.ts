import { setWhiteColorBuildings, WhiteColorBuildingsAction } from "./whiteColorBuildings.actions"

export function splitWhiteColorBuildingsAction(payload: boolean): WhiteColorBuildingsAction {
	return setWhiteColorBuildings(payload)
}
