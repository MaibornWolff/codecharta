import { WhiteColorBuildingsAction, WhiteColorBuildingsActions } from "./whiteColorBuildings.actions"

export function whiteColorBuildings(state: boolean = false, action: WhiteColorBuildingsAction): boolean {
	switch (action.type) {
		case WhiteColorBuildingsActions.SET_WHITE_COLOR_BUILDINGS:
			return action.payload
		default:
			return state
	}
}
