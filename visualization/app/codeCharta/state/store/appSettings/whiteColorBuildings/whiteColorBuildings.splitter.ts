import { setWhiteColorBuildings } from "./whiteColorBuildings.actions"

export function splitWhiteColorBuildingsAction(payload: boolean) {
	return setWhiteColorBuildings(payload)
}
