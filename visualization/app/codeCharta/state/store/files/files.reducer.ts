import { FilesAction, FilesSelectionActions, NewFilesImportedActions, setFiles } from "./files.actions"
import { Files } from "../../../model/files"

export default function files(state: Files = setFiles().payload, action: FilesAction): Files {
	switch (action.type) {
		case NewFilesImportedActions.SET_FILES: {
			state.setFiles(action.payload)
			return state
		}
		case NewFilesImportedActions.ADD_FILE: {
			state.addFile(action.payload)
			return state
		}
		case NewFilesImportedActions.RESET_FILES: {
			state.reset()
			return state
		}
		case FilesSelectionActions.RESET_SELECTION: {
			state.resetSelection()
			return state
		}
		case FilesSelectionActions.SET_SINGLE: {
			state.setSingle(action.payload)
			return state
		}
		case FilesSelectionActions.SET_SINGLE_BY_NAME: {
			state.setSingleByName(action.payload)
			return state
		}
		case FilesSelectionActions.SET_DELTA: {
			state.setDelta(action.payload.referenceFile, action.payload.comparisonFile)
			return state
		}
		case FilesSelectionActions.SET_DELTA_BY_NAMES: {
			state.setDeltaByNames(action.payload.referenceFileName, action.payload.comparisonFileName)
			return state
		}
		case FilesSelectionActions.SET_MULTIPLE: {
			state.setMultiple(action.payload)
			return state
		}
		case FilesSelectionActions.SET_MULTIPLE_BY_NAMES: {
			state.setMultipleByNames(action.payload)
			return state
		}
		default:
			return state
	}
}
