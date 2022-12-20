import { EnableFloorLabelAction, EnableFloorLabelsActions, setEnableFloorLabels } from "./enableFloorLabels.actions"

export function enableFloorLabels(state = setEnableFloorLabels().payload, action: EnableFloorLabelAction) {
	switch (action.type) {
		case EnableFloorLabelsActions.SET_ENABLE_FLOOR_LABELS:
			return action.payload
		default:
			return state
	}
}
