import { FilesAction, FilesSelectionActions, NewFilesImportedActions, setFiles } from "./files.actions"
import { CCFile } from "../../../codeCharta.model"
import { FileSelectionState, FileState } from "../../../model/files/files"
import { clone } from "../../../util/clone"

export default function files(state: FileState[] = setFiles().payload, action: FilesAction): FileState[] {
	switch (action.type) {
		case NewFilesImportedActions.SET_FILES:
			return clone(action.payload)
		case NewFilesImportedActions.ADD_FILE:
			return addFile(state, action.payload)
		case NewFilesImportedActions.RESET_FILES:
			return reset()
		case FilesSelectionActions.RESET_SELECTION:
			return resetSelection(state)
		case FilesSelectionActions.SET_SINGLE:
			return setSingle(state, action.payload)
		case FilesSelectionActions.SET_SINGLE_BY_NAME:
			return setSingleByName(state, action.payload)
		case FilesSelectionActions.SET_DELTA:
			return setDelta(state, action.payload.referenceFile, action.payload.comparisonFile)
		case FilesSelectionActions.SET_DELTA_BY_NAMES:
			return setDeltaByNames(state, action.payload.referenceFileName, action.payload.comparisonFileName)
		case FilesSelectionActions.SET_MULTIPLE:
			return setMultiple(state, action.payload)
		case FilesSelectionActions.SET_MULTIPLE_BY_NAMES:
			return setMultipleByNames(state, action.payload)
		default:
			return state
	}
}

function reset(): FileState[] {
	return []
}

function resetSelection(state: FileState[]): FileState[] {
	return state.map(x => {
		return { ...x, selectedAs: FileSelectionState.None }
	})
}

function addFile(state: FileState[], file: CCFile): FileState[] {
	return [...state, { file: clone(file), selectedAs: FileSelectionState.None }]
}

function setSingleByName(state: FileState[], fileName: string): FileState[] {
	return state.map(x => {
		if (x.file.fileMeta.fileName === fileName) {
			return { ...x, selectedAs: FileSelectionState.Single }
		} else {
			return { ...x, selectedAs: FileSelectionState.None }
		}
	})
}

function setSingle(state: FileState[], file: CCFile): FileState[] {
	return setSingleByName(state, file.fileMeta.fileName)
}

function setDeltaByNames(state: FileState[], referenceFileName: string, comparisonFileName: string): FileState[] {
	return state.map(x => {
		if (x.file.fileMeta.fileName === referenceFileName) {
			return { ...x, selectedAs: FileSelectionState.Reference }
		} else if (x.file.fileMeta.fileName === comparisonFileName) {
			return { ...x, selectedAs: FileSelectionState.Comparison }
		} else {
			return { ...x, selectedAs: FileSelectionState.None }
		}
	})
}

function setDelta(state: FileState[], reference: CCFile, comparison: CCFile): FileState[] {
	return setDeltaByNames(state, reference.fileMeta.fileName, comparison.fileMeta.fileName)
}

function setMultipleByNames(state: FileState[], partialFileNames: string[]): FileState[] {
	return state.map(x => {
		if (partialFileNames.includes(x.file.fileMeta.fileName)) {
			return { ...x, selectedAs: FileSelectionState.Partial }
		} else {
			return { ...x, selectedAs: FileSelectionState.None }
		}
	})
}

function setMultiple(state: FileState[], multipleFiles: CCFile[]): FileState[] {
	return setMultipleByNames(
		state,
		multipleFiles.map(x => x.fileMeta.fileName)
	)
}
