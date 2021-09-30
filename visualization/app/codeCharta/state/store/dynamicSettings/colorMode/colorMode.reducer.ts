import { ColorModeAction, ColorModeActions, setColorMode } from "./colorMode.actions"

export function colorMode(state = setColorMode().payload, action: ColorModeAction) {
	switch (action.type) {
		case ColorModeActions.SET_COLOR_MODE:
			return action.payload
		default:
			return state
	}
}
