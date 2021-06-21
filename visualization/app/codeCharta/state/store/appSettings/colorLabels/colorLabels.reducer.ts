import { ColorLabelsAction, ColorLabelsActions, setColorLabels } from "./colorLabels.actions"

export function colorLabels(state = setColorLabels().payload, action: ColorLabelsAction) {
	switch (action.type) {
		case ColorLabelsActions.SET_COLOR_LABELS:
			return action.payload
		default:
			return state
	}
}
