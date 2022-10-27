import { Action, combineReducers } from "redux"

import appSettings from "./appSettings/appSettings.reducer"
import fileSettings from "./fileSettings/fileSettings.reducer"
import dynamicSettings from "./dynamicSettings/dynamicSettings.reducer"
import files from "./files/files.reducer"
import appStatus from "./appStatus/appStatus.reducer"
import { SetStateAction, StateActions } from "./state.actions"
import { State } from "../../codeCharta.model"
import { clone } from "../../util/clone"

const appReducer = combineReducers({
	fileSettings,
	appSettings,
	dynamicSettings,
	files,
	appStatus
})

const rootReducer = (state: State, action: Action) => {
	if (isSetStateAction(action)) {
		const newState = clone(state)
		return applyPartialState(newState, action.payload)
	}

	return appReducer(state, action)
}

export default rootReducer

function isSetStateAction(action: Action): action is SetStateAction {
	return action.type === StateActions.SET_STATE
}

const objectWithDynamicKeysInStore = new Set([
	"fileSettings.attributeTypes",
	"fileSettings.blacklist",
	"fileSettings.edges",
	"fileSettings.markedPackages",
	"dynamicSettings.focusedNodePath",
	"files" // ToDo; this should be a Map with an unique id
])

function applyPartialState<T>(applyTo: T, toBeApplied: unknown, composedPath = []): T {
	for (const [key, value] of Object.entries(toBeApplied)) {
		if (value === null || value === undefined) {
			continue
		}

		if (!isKeyOf(applyTo, key)) {
			continue
		}

		const newComposedPath = [...composedPath, key]
		const composedJoinedPath = newComposedPath.join(".")

		applyTo[key] =
			typeof value !== "object" || objectWithDynamicKeysInStore.has(composedJoinedPath)
				? value
				: applyPartialState(applyTo[key], value, newComposedPath)
	}

	return applyTo
}

function isKeyOf<T>(of: T, key: PropertyKey): key is keyof T {
	return Object.prototype.hasOwnProperty.call(of, key)
}
