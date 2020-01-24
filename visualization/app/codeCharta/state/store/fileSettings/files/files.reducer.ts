import { FilesAction, FilesActions, setFiles } from "./files.actions"
import { Files } from "../../../../model/files"

export function files(state: Files = setFiles().payload, action: FilesAction): Files {
	switch (action.type) {
		case FilesActions.SET_FILES: {
			state.setFiles(action.payload)
			return state
		}
		case FilesActions.RESET_FILES: {
			state.reset()
			return state
		}
		case FilesActions.RESET_SELECTION: {
			state.resetSelection()
			return state
		}
		case FilesActions.SET_SINGLE: {
			state.setSingle(action.payload)
			return state
		}
		case FilesActions.SET_SINGLE_BY_NAME: {
			state.setSingleByName(action.payload)
			return state
		}
		case FilesActions.SET_DELTA: {
			state.setDelta(action.payload.referenceFile, action.payload.comparisonFile)
			return state
		}
		case FilesActions.SET_DELTA_BY_NAME: {
			state.setDeltaByNames(action.payload.referenceFileName, action.payload.comparisonFileName)
			return state
		}
		case FilesActions.SET_MULTIPLE: {
			state.setMultiple(action.payload)
			return state
		}
		case FilesActions.SET_MULTIPLE_BY_NAME: {
			state.setMultipleByNames(action.payload)
			return state
		}
		default:
			return state
	}
}
