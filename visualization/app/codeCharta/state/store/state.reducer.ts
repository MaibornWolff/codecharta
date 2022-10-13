import { Action, combineReducers } from "redux"

import appSettings from "./appSettings/appSettings.reducer"
import fileSettings from "./fileSettings/fileSettings.reducer"
import dynamicSettings from "./dynamicSettings/dynamicSettings.reducer"
import treeMap from "./treeMap/treeMap.reducer"
import files from "./files/files.reducer"
import appStatus from "./appStatus/appStatus.reducer"
import { SetStateAction, StateActions } from "./state.actions"
import { State } from "../../codeCharta.model"

const appReducer = combineReducers({
	fileSettings,
	appSettings,
	dynamicSettings,
	treeMap,
	files,
	appStatus
})

const rootReducer = (state: State, action: Action) => {
	if (isSetStateAction(action)) {
		return applyPartialState(state, action.payload)
	}

	return appReducer(state, action)
}

export default rootReducer

function isSetStateAction(action: Action): action is SetStateAction {
	return action.type === StateActions.SET_STATE
}

// That is one reason why the splitter architecture was a bad idea -.-
const removedKeysFromStore = new Set(["recentFiles", "isAttributeSideBarVisible"])

function applyPartialState<T>(applyTo: T, toBeApplied: unknown): T {
	for (const [key, value] of Object.entries(toBeApplied)) {
		if (!isKeyOf(applyTo, key)) {
			if (removedKeysFromStore.has(key)) {
				continue
			}
			throw new Error(`cannot restore key "${key}" as it doesn't exist in store`)
		}

		applyTo[key] = typeof value !== "object" ? value : applyPartialState(applyTo[key], value)
	}

	return applyTo
}

function isKeyOf<T>(of: T, key: PropertyKey): key is keyof T {
	return Object.prototype.hasOwnProperty.call(of, key)
}
