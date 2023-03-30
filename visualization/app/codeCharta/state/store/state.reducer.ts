import { appSettings } from "./appSettings/appSettings.reducer"
import { fileSettings } from "./fileSettings/fileSettings.reducer"
import { dynamicSettings } from "./dynamicSettings/dynamicSettings.reducer"
import { files } from "./files/files.reducer"
import { combineReducers } from "@ngrx/store"

export const appReducer = combineReducers({
	fileSettings,
	appSettings,
	dynamicSettings,
	files
})

// const rootReducer = (state: Partial<State>, action: Action): State => {
// 	if (isSetStateAction(action)) {
// 		const newState = clone(state)
// 		// @ts-ignore
// 		return applyPartialState(newState, action.payload)
// 	}

// 	// @ts-ignore
// 	return appReducer(state, action)
// }

// export default rootReducer

// const objectWithDynamicKeysInStore = new Set([
// 	"fileSettings.attributeTypes",
// 	"fileSettings.attributeDescriptors",
// 	"fileSettings.blacklist",
// 	"fileSettings.edges",
// 	"fileSettings.markedPackages",
// 	"dynamicSettings.focusedNodePath",
// 	"files" // ToDo; this should be a Map with an unique id
// ])

// function applyPartialState<T>(applyTo: T, toBeApplied: unknown, composedPath = []): T {
// 	for (const [key, value] of Object.entries(toBeApplied)) {
// 		if (value === null || value === undefined) {
// 			continue
// 		}

// 		if (!isKeyOf(applyTo, key)) {
// 			continue
// 		}

// 		const newComposedPath = [...composedPath, key]
// 		const composedJoinedPath = newComposedPath.join(".")

// 		applyTo[key] =
// 			typeof value !== "object" || objectWithDynamicKeysInStore.has(composedJoinedPath)
// 				? value
// 				: applyPartialState(applyTo[key], value, newComposedPath)
// 	}

// 	return applyTo
// }

// function isKeyOf<T>(of: T, key: PropertyKey): key is keyof T {
// 	return Object.prototype.hasOwnProperty.call(of, key)
// }
