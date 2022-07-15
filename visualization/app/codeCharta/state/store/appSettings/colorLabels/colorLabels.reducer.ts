import { ColorLabelsAction, ColorLabelsActions, defaultColorLabels } from "./colorLabels.actions"

export function colorLabels(state = defaultColorLabels, action: ColorLabelsAction) {
	switch (action.type) {
		case ColorLabelsActions.SET_COLOR_LABELS:
			return { ...state, ...action.payload }
		default:
			return state
	}
}
