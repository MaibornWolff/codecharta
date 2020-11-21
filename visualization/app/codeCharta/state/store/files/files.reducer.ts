import { FilesAction, FilesSelectionActions, NewFilesImportedActions, setFiles } from "./files.actions"
import { CCFile } from "../../../codeCharta.model"
import { FileSelectionState, FileState } from "../../../model/files/files"

export default function files(state = setFiles().payload, action: FilesAction) {
	switch (action.type) {
		case NewFilesImportedActions.SET_FILES:
			return action.payload
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

function addFile(state: FileState[], file: CCFile) {
	return [...state, { file, selectedAs: FileSelectionState.None }]
}

function setSingleByName(state: FileState[], fileName: string): FileState[] {
	return state.map(x => {
		let selectedAs = FileSelectionState.None
		if (x.file.fileMeta.fileName === fileName) {
			selectedAs = FileSelectionState.Single
		}
		return { ...x, selectedAs }
	})
}

function setSingle(state: FileState[], file: CCFile) {
	return setSingleByName(state, file.fileMeta.fileName)
}

function setDeltaByNames(state: FileState[], referenceFileName: string, comparisonFileName: string): FileState[] {
	return state.map(x => {
		let selectedAs = FileSelectionState.None
		if (x.file.fileMeta.fileName === referenceFileName) {
			selectedAs = FileSelectionState.Reference
		} else if (x.file.fileMeta.fileName === comparisonFileName) {
			selectedAs = FileSelectionState.Comparison
		}
		return { ...x, selectedAs }
	})
}

function setDelta(state: FileState[], reference: CCFile, comparison: CCFile) {
	return setDeltaByNames(state, reference.fileMeta.fileName, comparison.fileMeta.fileName)
}

function setMultipleByNames(state: FileState[], partialFileNames: string[]): FileState[] {
	return state.map(x => {
		let selectedAs = FileSelectionState.None
		if (partialFileNames.includes(x.file.fileMeta.fileName)) {
			selectedAs = FileSelectionState.Partial
		}
		return { ...x, selectedAs }
	})
}

function setMultiple(state: FileState[], multipleFiles: CCFile[]) {
	return setMultipleByNames(
		state,
		multipleFiles.map(x => x.fileMeta.fileName)
	)
}
