import { appSettings, defaultAppSettings } from "./appSettings/appSettings.reducer"
import { defaultFileSettings, fileSettings } from "./fileSettings/fileSettings.reducer"
import { defaultDynamicSettings, dynamicSettings } from "./dynamicSettings/dynamicSettings.reducer"
import { defaultFiles, files } from "./files/files.reducer"
import { appStatus, defaultAppStatus } from "./appStatus/appStatus.reducer"
import { ActionReducer } from "@ngrx/store"
import { CcState } from "../../codeCharta.model"
import { isSetStateAction } from "./state.actions"
import { clone } from "../../util/clone"

export const appReducers = {
	fileSettings,
	appSettings,
	dynamicSettings,
	files,
	appStatus
}
export const defaultState: CcState = {
	fileSettings: defaultFileSettings,
	appSettings: defaultAppSettings,
	dynamicSettings: defaultDynamicSettings,
	files: defaultFiles,
	appStatus: defaultAppStatus
}

export const setStateMiddleware =
	(reducer: ActionReducer<CcState>): ActionReducer<CcState> =>
	(state, action) => {
		if (isSetStateAction(action)) {
			const newState = clone(state)
			return applyPartialState(newState, action.value)
		}
		return reducer(state, action)
	}

const objectWithDynamicKeysInStore = new Set([
	"fileSettings.attributeTypes",
	"fileSettings.attributeDescriptors",
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
